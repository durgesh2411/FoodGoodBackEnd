import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getLastSixEventsUserCounts,
  getTotalDonatedAmount,
  getTotalEvents,
  getTotalHoursVolunteered,
  getTotalVolunteers,
  getUserHoursForPieChart,
} from "../Controllers/dashboard.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/admin/getTotalDonatedAmount").get(getTotalDonatedAmount);
router.route("/admin/getTotalVolunteers").get(getTotalVolunteers); // both volunteer and user
router.route("/admin/getTotalEvents").get(getTotalEvents); // both volunteer and user
router
  .route("/admin/getLastSixEventsUserCounts")
  .get(getLastSixEventsUserCounts);
router.route("/admin/getTotalHoursVolunteered").get(getTotalHoursVolunteered);
router.route("/admin/getUserHoursForPieChart").get(getUserHoursForPieChart);

export default router;
