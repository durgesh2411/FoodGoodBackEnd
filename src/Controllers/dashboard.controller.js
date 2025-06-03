import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Donation } from "../models/donation.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import { Event } from "../models/event.model.js";
// total donation
const getTotalDonatedAmount = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to view all donations");
  }

  const totalDonatedSum = await User.aggregate([
    { $match: { totalDonatedAmount: { $gt: 0 } } },
    { $group: { _id: null, totalAmount: { $sum: "$totalDonatedAmount" } } },
    { $project: { _id: 0, totalAmount: 1 } },
  ]);

  const totalAmount =
    totalDonatedSum.length > 0 ? totalDonatedSum[0].totalAmount : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalAmount,
      },
      "Total donations by user and overall sum fetched successfully"
    )
  );
});

// total number of volunteers
const getTotalVolunteers = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to view this information"
    );
  }

  const totalVolunteers = await User.countDocuments({ role: "volunteer" });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVolunteers },
        "Total number of volunteers fetched successfully"
      )
    );
});

const getTotalEvents = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to view this information"
    );
  }

  const totalEvents = await Event.countDocuments();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalEvents },
        "Total number of events fetched successfully"
      )
    );
});

const getLastSixEventsUserCounts = asyncHandler(async (req, res) => {
  const lastSixEvents = await Event.find({}).sort({ createdAt: -1 }).limit(6);
  const eventData = lastSixEvents.map((event) => ({
    title: event.title,
    userCount: event.participants.length,
  }));

  res.status(200).json({
    success: true,
    data: eventData,
    message:
      "Total registered users and event names for the last 6 events fetched successfully.",
  });
});

const getTotalHoursVolunteered = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to view this information"
    );
  }

  const totalHours = await User.aggregate([
    { $match: { totalWorkedHours: { $gt: 0 } } },
    { $group: { _id: null, totalHours: { $sum: "$totalWorkedHours" } } },
    { $project: { _id: 0, totalHours: 1 } },
  ]);

  const totalHoursVolunteered =
    totalHours.length > 0 ? totalHours[0].totalHours : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalHoursVolunteered,
      },
      "Total hours volunteered by user and overall sum fetched successfully"
    )
  );
});

const getUserHoursForPieChart = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      400,
      "You do not have permission to view this information"
    );
  }

  const userHours = await User.aggregate([
    { $match: { totalWorkedHours: { $gt: 0 } } },
    { $project: { _id: 0, fullName: 1, totalWorkedHours: 1 } },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userHours,
        "User names and total worked hours fetched successfully for pie chart"
      )
    );
});

export {
  getTotalDonatedAmount,
  getTotalVolunteers,
  getTotalEvents,
  getLastSixEventsUserCounts,
  getTotalHoursVolunteered,
  getUserHoursForPieChart,
};
