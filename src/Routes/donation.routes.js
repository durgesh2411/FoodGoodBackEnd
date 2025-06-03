import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDonation,
  getAllDonations,
  getAllDonationsWithTotal,
  getDonationById,
  verifyDonation,
} from "../Controllers/donation.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createDonation);
router.route("/verify").post(verifyDonation);
router.route("/admin/getDonations").get(getAllDonations);
router.route("/admin/getAllDonationsWithTotal").get(getAllDonationsWithTotal);
router.route("/admin/getDonations/:donationId").get(getDonationById);

export default router;
