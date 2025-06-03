import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  deletePost,
  getAllApprovedPosts,
  getAllPendingPosts,
  getVolunteerPosts,
  updatePost,
  approvePost,
} from "../Controllers/post.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPost);
router.route("/volunteer/allPosts").get(getAllApprovedPosts); // both volunteer and admin
router.route("/volunteer/myPosts").get(getVolunteerPosts); // both volunteer and admin
router.route("/admin/pendingPosts").get(getAllPendingPosts); // admin
router.route("/admin/:postId").patch(approvePost); // admin
router.route("/:postId").patch(updatePost).delete(deletePost);

export default router;
