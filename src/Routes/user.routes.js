import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  refreshAccessToken,
  loginUser,
  logoutUser,
  becomeVolunteer,
} from "../Controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),

  registerUser
);

router.route("/login").post(loginUser);
router.route("/becomeVolunteer").patch(verifyJWT, becomeVolunteer);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
