import { isValidObjectId } from "mongoose";
import { VolunteerWork } from "../models/volunteerWork.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//done
const createVolunteerWork = asyncHandler(async (req, res) => {
  const { title, numberOfHours, description } = req.body;

  const volunteer = req.user;

  if (!volunteer) {
    throw new ApiError(400, "Volunteer not found");
  }

  // console.log(owner.role);
  if (volunteer.role !== "volunteer") {
    throw new ApiError(400, "Only volunteers can upload volunteer work");
  }
  if (!(title || numberOfHours || description)) {
    throw new ApiError(400, "All fields are required");
  }

  const workFileLocalPath = (await req.files?.workFile)
    ? req.files?.workFile?.[0].path
    : null;

  if (!workFileLocalPath) {
    throw new ApiError(400, "Report is required");
  }
  const workFile = await uploadOnCloudinary(workFileLocalPath);
  if (!workFile) {
    throw new ApiError(400, "Report is required");
  }
  const volunteerWork = await VolunteerWork.create({
    title,
    numberOfHours,
    description,
    owner: volunteer._id,
    workFile: workFile.url,
  });
  console.log(volunteerWork.owner);

  if (!volunteerWork) {
    throw new ApiError(500, "Volunteer work creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, volunteerWork, "Volunteer work successfully created")
    );
});

//done
const getAllVolunteerWorks = asyncHandler(async (req, res) => {
  const volunteerWorks = await VolunteerWork.find();
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Only admins can access this route"));
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { volunteerWorks },
        "Volunteer works fetched successfully"
      )
    );
});

//done
const updateVolunteerWork = asyncHandler(async (req, res) => {
  const { volunteerWorkId } = req.params;
  const { title, numberOfHours, description } = req.body;

  try {
    if (!isValidObjectId(volunteerWorkId)) {
      throw new ApiError(401, "Volunteer work not found");
    }

    if (!(title || numberOfHours || description)) {
      throw new ApiError(400, "Atleast one field is required ");
    }

    const volunteerWork = await VolunteerWork.findById(volunteerWorkId);

    if (volunteerWork.owner.toString() !== req.user.id) {
      throw new ApiError(
        403,
        "You are not authorized to update this volunteer work"
      );
    }

    const newVolunteerWork = await VolunteerWork.findByIdAndUpdate(
      volunteerWorkId,
      {
        $set: {
          title,
          numberOfHours,
          description,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          201,
          newVolunteerWork,
          "Volunteer work updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

//done
const deleteVolunteerWork = asyncHandler(async (req, res) => {
  const { volunteerWorkId } = req.params;

  if (!isValidObjectId(volunteerWorkId)) {
    throw new ApiError(400, "Volunteer work Id is not valid");
  }

  const volunteerWork = await VolunteerWork.findById(volunteerWorkId);
  if (!volunteerWork) {
    throw new ApiError(400, "Could not find the volunteer work to be deleted");
  }
  if (volunteerWork.owner.toString() !== req.user.id) {
    throw new ApiError(
      400,
      "You do not have permission to delete the volunteer work"
    );
  }

  await VolunteerWork.findByIdAndDelete({ _id: volunteerWork._id });
  return res
    .status(200)
    .json(new ApiResponse(201, null, "Volunteer work deleted successfully."));
});

//done
const approveVolunteerWork = asyncHandler(async (req, res) => {
  const { volunteerWorkId } = req.params;

  if (!isValidObjectId(volunteerWorkId)) {
    throw new ApiError(400, "Volunteer Work Id is not valid");
  }

  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to approve the work");
  }

  const volunteerWork = await VolunteerWork.findById(volunteerWorkId);
  console.log("Volunteer Work", volunteerWork);
  if (!volunteerWork) {
    throw new ApiError(400, "Could not find the volunteer work to be approved");
  }
  if (volunteerWork.status === "approved") {
    throw new ApiError(400, "Volunteer work is already approved");
  }

  console.log("Volunteer Work owner ", volunteerWork.owner);
  const volunteer = await User.findById(volunteerWork.owner);
  console.log("Volunteer", volunteer);
  if (!volunteer) {
    throw new ApiError(404, "Volunteer not found");
  }
  console.log("Volunteer Work number of hrs ", volunteerWork.numberOfHours);

  volunteer.totalWorkedHours += volunteerWork.numberOfHours;
  await volunteer.save();

  const updatedVolunteerWork = await VolunteerWork.findByIdAndUpdate(
    volunteerWorkId,
    { $set: { status: "approved" } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(201, updatedVolunteerWork, "Work approved successfully")
    );
});

// not checked
const getVolunteersWithHours = asyncHandler(async (req, res) => {
  const volunteers = await User.find(
    { totalWorkedHours: { $gt: 0 }, role: "volunteer" },
    "fullName avatar totalWorkedHours"
  ).sort({ totalWorkedHours: -1 });
  if (!volunteers) {
    throw new ApiError(404, "No volunteers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        volunteers,
        "Volunteers with hours fetched successfully"
      )
    );
});

// done
const getAllPendingVolunteerWorks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isAdmin != true) {
    throw new ApiError(403, "You are not authorized to access this route");
  }
  const volunteerWorks = await VolunteerWork.find({ status: "pending" });
  if (!volunteerWorks) {
    throw new ApiError(404, "No pending volunteer works found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        volunteerWorks,
        "Pending volunteer works fetched successfully"
      )
    );
});

export {
  createVolunteerWork,
  updateVolunteerWork,
  deleteVolunteerWork,
  getAllVolunteerWorks,
  approveVolunteerWork,
  getVolunteersWithHours,
  getAllPendingVolunteerWorks,
};
