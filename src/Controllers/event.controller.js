import { isValidObjectId } from "mongoose";
import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../utils/emailUtil.js";

//DONE
const createEvent = asyncHandler(async (req, res) => {
  //TODO: create event
  const { title, description, date, time, location } = req.body;

  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to create a event");
  }
  // console.log(req.body);/
  // console.log(req.files);

  if (!(description && title && date && time && location)) {
    throw new ApiError(400, "All fields are required");
  }

  const event_imageLocalPath = await req.files?.event_image?.[0].path;

  if (!event_imageLocalPath) {
    throw new ApiError(400, "Image is required");
  }

  const event_image = await uploadOnCloudinary(event_imageLocalPath);
  if (!event_image) {
    throw new ApiError(400, "Event image is required");
  }
  const event = await Event.create({
    description,
    title,
    date,
    time,
    location,
    event_image: event_image.url,
  });

  if (!event) {
    throw new ApiError(500, "Event creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, event, "Event successfully created"));
});

//DONE
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res
    .status(200)
    .json(new ApiResponse(200, { events }, "Events fetched successfully"));
});

const getEventById = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, { event }, "Event fetched successfully"));
});
// DONE
const updateEvent = asyncHandler(async (req, res) => {
  //TODO: update event
  const { eventId } = req.params;
  const { title, description, date, time, location } = req.body;

  try {
    if (!isValidObjectId(eventId)) {
      throw new ApiError(401, "Event not found");
    }

    if (!(title || description || date || time || location)) {
      throw new ApiError(400, "All fields are required");
    }

    if (!req.user?.isAdmin) {
      throw new ApiError(
        400,
        "You do not have permission to update the event."
      );
    }

    const newEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          description,
          date,
          title,
          location,
          time,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(201, newEvent, "Event updated successfully"));
  } catch (error) {
    throw new ApiError(500, "catch ");
  }
});

// DONE
const deleteEvent = asyncHandler(async (req, res) => {
  //TODO: delete event
  const { eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    throw new ApiError(400, "Event Id is not valid");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(400, "Could not find the event to be deleted");
  }
  if (!req.user?.isAdmin) {
    throw new ApiError(400, "You do not have permission to delete the event");
  }

  await Event.findByIdAndDelete({ _id: event._id });
  return res
    .status(200)
    .json(new ApiResponse(201, null, "Event  deleted successfully."));
});

//user register for event
//DONE
const registerForEvent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    throw new ApiError(400, "Event Id is not valid");
  }
  const event = await Event.findById(eventId);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  if (user.role !== "user") {
    throw new ApiError(400, "Only users can register for event");
  }

  if (event.participants.includes(userId)) {
    throw new ApiError(400, "You are already registered for this event");
  }

  event.participants.push(userId);
  await event.save();

  const response = {
    event: event,
    user: {
      name: user.fullName,
      number: user.number,
      email: user.email,
    },
    message: "Successfully registered for event",
  };

  //  email details
  const emailDetails = {
    to: user.email,
    subject: "Successfully registered for " + event.title,
    text: "This mail is sent to confirm your registration for the event.",
  };

  // Send the email
  sendMail(emailDetails)
    .then(() => console.log("Email sent successfully."))
    .catch((error) => console.error("Failed to send email:", error));

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Successfully registered for event"));
});

//get registered users for an event
//DONE
const getRegisteredUsers = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    throw new ApiError(400, "Event Id is not valid");
  }

  if (!req.user.isAdmin) {
    throw new ApiError(400, "Not athorized to view participants");
  }

  const event = await Event.findById(eventId).populate(
    "participants",
    "fullName email number"
  );

  if (!event) {
    throw new ApiError(400, "Event not found");
  }

  const participants = event.participants;
  const numberOfParticipants = participants.length;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { participants, numberOfParticipants },
        "Participants fetched successfully"
      )
    );
});

export {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  registerForEvent,
  getRegisteredUsers,
  getEventById,
};
