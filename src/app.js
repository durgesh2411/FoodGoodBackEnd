import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";
import feedbackRoutes from "./Routes/feedback.routes.js";
axios.defaults.withCredentials = true;

const app = express();

const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// --- FIX: Add express.json() and express.urlencoded() BEFORE routes ---
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());

// Register feedback route and other routes after middleware
app.use("/api/v1/feedback", feedbackRoutes);

import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";
import postRouter from "./routes/post.routes.js";
import announcementRouter from "./routes/announcement.routes.js";
import volunteerWorkRouter from "./routes/volunteerWork.routes.js";
import donationRouter from "./routes/donation.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/users", userRouter); // tested
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/donations", donationRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/volunteerWorks", volunteerWorkRouter);

app.use("/", (req, res) => {
  res.send("Welcome to VMS API");
});
export { app };
