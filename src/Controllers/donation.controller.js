import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Donation } from "../models/donation.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import { createDonationOrder, verifyDonationOrder } from "../utils/payment.js";
import { sendMail } from "../utils/emailUtil.js";

const createDonation = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const owner = req.user._id;

  if (!amount) {
    throw new ApiError(400, "Amount and name are required");
  }
  const order = await createDonationOrder(amount);
  if (!order) {
    throw new ApiError(500, "Donation order creation failed");
  }
  //   console.log("order Id", order.id);

  const donation = await Donation.create({
    orderId: order.id, // Assuming order.data contains the payment_id
    amount: amount,
    receipt: order.receipt,
    owner: owner,
    fullName: req.user.fullName,
  });
  res
    .status(201)
    .json(new ApiResponse(201, order, "Donation order successfully created"));
});

const verifyDonation = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Verify the payment
  const isVerified = await verifyDonationOrder(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  //   console.log(isVerified);

  if (!isVerified) {
    throw new ApiError(400, "Payment verification failed");
  }
  // console.log("HI");
  // Update the donation status
  const donation = await Donation.findOne({ orderId: razorpay_order_id });
  if (!donation) {
    throw new ApiError(404, "Order not found");
  }
  donation.status = "accepted";
  await donation.save();
  //   console.log("HI");

  // Update the user's total donated amount
  //   console.log("Order", donation.owner);
  const user = await User.findById(donation.owner);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //   console.log("User", user);
  //   console.log("TotalDonatedAmoount before", user.totalDonatedAmount);
  user.totalDonatedAmount += donation.amount;
  sendMail({
    to: user.email,
    subject: "Donation Successful",
    text: `Your donation of INR ${donation.amount} has been successfully recorded. Thank you for your contribution! 
     
Best Regards,
NGO Team`,
  });
  //   console.log("TotalDonatedAmoount after", user.totalDonatedAmount);
  await user.save();

  // Respond with success
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        donation,
        "Donation verified and recorded successfully"
      )
    );
});

// Get all donations //done
const getAllDonations = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to view all donations");
  }
  const donations = await Donation.find()
    .populate("owner", "fullName")
    .sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, donations, "Donations fetched successfully"));
});

//Get donations of users with total //done
const getAllDonationsWithTotal = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to view all donations");
  }

  const usersWithDonations = await User.find(
    { totalDonatedAmount: { $gt: 0 } },
    "fullName email totalDonatedAmount"
  ).sort({ totalDonatedAmount: -1 });

  const usersTotalDonations = usersWithDonations.map((user) => ({
    fullName: user.fullName,
    email: user.email,
    totalDonatedAmount: user.totalDonatedAmount,
  }));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        usersTotalDonations,
        "Total donations by user fetched successfully"
      )
    );
});

// Get donation by ID //done
const getDonationById = asyncHandler(async (req, res) => {
  const { donationId } = req.params;
  if (!isValidObjectId(donationId)) {
    throw new ApiError(400, "Invalid donation ID");
  }

  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to view all donations");
  }
  const donation = await Donation.findById(donationId).populate({
    path: "owner",
    select: "fullName amount", // Corrected: Specify fields as a space-separated string
  });
  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation fetched successfully"));
});

export {
  createDonation,
  getAllDonations,
  getDonationById,
  getAllDonationsWithTotal,
  verifyDonation,
};
