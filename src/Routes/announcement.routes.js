import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getUserAnnouncements,
  getVolunteerAnnouncements,
  updateAnnouncement,
} from "../Controllers/announcement.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createAnnouncement);
router.route("/admin/").get(getAllAnnouncements); // both volunteer and user
router.route("/volunteer/").get(getVolunteerAnnouncements); // both volunteer and admin
router.route("/user/").get(getUserAnnouncements); // admin
router
  .route("/:announcementId")
  .patch(updateAnnouncement)
  .delete(deleteAnnouncement);

export default router;
