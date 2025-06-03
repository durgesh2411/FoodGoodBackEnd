import { isValidObjectId } from "mongoose";
import { Announcement } from "../models/announcement.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../utils/emailUtil.js";
import { sendSMS } from "../utils/smsUtil.js";
//done
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, announcement_type, content, visibility } = req.body;

  const fetchEmailsAndNumbersBasedOnVisibility = async (visibility) => {
    let users;
    if (visibility === "volunteer") {
      users = await User.find({ role: "volunteer" });
    } else if (visibility === "user") {
      users = await User.find({ role: "user" });
    } else {
      users = await User.find();
    }
    return users.map((user) => ({ email: user.email, number: user.number }));
  };

  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to create an announcement"
    );
  }

  if (!(title && announcement_type && content && visibility)) {
    throw new ApiError(400, "All fields are required");
  }

  const announcement = await Announcement.create({
    title,
    announcement_type,
    content,
    visibility,
  });

  if (!announcement) {
    throw new ApiError(500, "Announcement creation failed");
  }

  const recipients = await fetchEmailsAndNumbersBasedOnVisibility(visibility);

  const subject = `New Announcement: ${title}`;
  const emailBody = `Dear User,\n\n${content}\n\nBest Regards,\nNGO Team`;

  recipients.forEach(({ email, number }) => {
    sendMail({
      to: email,
      subject,
      text: emailBody,
    }).catch((error) => {
      console.error(`Failed to send email to ${email}:`, error);
    });
    console.log(`Sending SMS to: +91${number}, Message: ${emailBody}`);
    sendSMS({
      to: "+91" + number,
      message: emailBody,
    }).catch((error) => {
      console.error(`Failed to send sms to ${number}:`, error);
    });
  });

  return res
    .status(201)
    .json(
      new ApiResponse(200, announcement, "Announcement successfully created")
    );
});

//done
const getAllAnnouncements = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to fetch an announcement"
    );
  }
  const announcements = await Announcement.find();
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { announcements },
        "Announcements fetched successfully"
      )
    );
});

//done
const getVolunteerAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({
    $or: [{ visibility: "volunteer" }, { visibility: "all" }],
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { announcements },
        "Volunteer announcements fetched successfully"
      )
    );
});

//done
const getUserAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({
    $or: [{ visibility: "user" }, { visibility: "all" }],
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { announcements },
        "User announcements fetched successfully"
      )
    );
});

//done
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const { title, announcement_type, content, visibility } = req.body;

  try {
    if (!isValidObjectId(announcementId)) {
      throw new ApiError(401, "Announcement not found");
    }

    if (!(title || announcement_type || content || visibility)) {
      throw new ApiError(400, "Atleast one field is required ");
    }

    if (!req.user.isAdmin) {
      throw new ApiError(
        400,
        "You do not have permission to update the announcement."
      );
    }

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      {
        $set: {
          title,
          announcement_type,
          content,
          visibility,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(201, announcement, "Announcement updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

//done
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;

  if (!isValidObjectId(announcementId)) {
    throw new ApiError(400, "Announcement Id is not valid");
  }

  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(400, "Could not find the announcement to be deleted");
  }
  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to delete the announcement"
    );
  }

  await Announcement.findByIdAndDelete({ _id: announcement._id });
  return res
    .status(200)
    .json(new ApiResponse(201, null, "Announcement deleted successfully."));
});

export {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getUserAnnouncements,
  getVolunteerAnnouncements,
};
