// filepath: backend/src/models/feedback.model.js
import mongoose from "mongoose";
const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
export const Feedback = mongoose.model("Feedback", feedbackSchema);
