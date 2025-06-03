import e from "express";
import mongoose, { Schema } from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    receipt: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["rejected", "accepted"],
      required: true,
      default: "rejected",
    },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);

export { Donation };
