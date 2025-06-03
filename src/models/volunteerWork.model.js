import mongoose, { Schema } from "mongoose";

const volunteerWorkSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    workFile: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfHours: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

export const VolunteerWork = mongoose.model(
  "VolunteerWork",
  volunteerWorkSchema
);
