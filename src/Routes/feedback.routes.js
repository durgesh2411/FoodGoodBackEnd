// filepath: backend/src/Routes/feedback.routes.js
import { Router } from "express";
import { createFeedback, getFeedbacks } from "../Controllers/feedback.controller.js";
const router = Router();
router.post("/", createFeedback);
router.get("/", getFeedbacks);
export default router;
