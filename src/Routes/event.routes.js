import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getRegisteredUsers,
  registerForEvent,
  updateEvent,
} from "../Controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(
  upload.fields([
    {
      name: "event_image",
      maxCount: 1,
    },
  ]),
  createEvent
);

router.route("/getEvents").get(getAllEvents);
router.route("/getEvents/:eventId").get(getEventById).post(registerForEvent); //button

router.route("/getRegisteredUsers/:eventId").get(getRegisteredUsers); //admin

router
  .route("/:eventId")
  .patch(
    upload.fields([
      {
        name: "event_image",
        maxCount: 1,
      },
    ]),
    updateEvent
  )
  .delete(deleteEvent);

export default router;
