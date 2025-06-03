import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      req: true,
    },
    description: {
      type: String,
      req: true,
    },
    date: {
      type: String,
      req: true,
    },
    time: {
      type: String,
      req: true,
    },
    location: {
      type: String,
      req: true,
    },
    event_image: {
      type: String,
      req: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
