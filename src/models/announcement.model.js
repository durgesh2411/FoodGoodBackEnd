import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    announcement_type: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
      default: "A",
    },
    title: {
      type: "String",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["user", "volunteer", "all"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
