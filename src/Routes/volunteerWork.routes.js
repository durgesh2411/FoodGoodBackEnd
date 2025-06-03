// import { Router } from "express";

// import { verifyJWT } from "../middlewares/auth.middleware.js";

// import {
//   approveVolunteerWork,
//   createVolunteerWork,
//   deleteVolunteerWork,
//   getAllPendingVolunteerWorks,
//   getAllVolunteerWorks,
//   getVolunteersWithHours,
//   updateVolunteerWork,
// } from "../Controllers/volunteerWork.controller.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router
//   .route("/")
//   .post(
//     upload.fields([{ name: "workFile", maxCount: 1 }]),
//     createVolunteerWork
//   );
// router.route("/admin/").get(getAllVolunteerWorks); // both volunteer and user
// router
//   .route("/admin/approvedVolunteerWorkWithHours")
//   .get(getVolunteersWithHours);
// router.route("/admin/volunteerPendingWorks").get(getAllPendingVolunteerWorks); // both volunteer and user
// router.route("/admin/:volunteerWorkId").patch(approveVolunteerWork); // admin
// router
//   .route("/:volunteerWorkId")
//   .patch(
//     upload.fields([{ name: "workFile", maxCount: 1 }]),
//     updateVolunteerWork
//   )
//   .delete(deleteVolunteerWork);

// export default router;


import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  approveVolunteerWork,
  createVolunteerWork,
  deleteVolunteerWork,
  getAllPendingVolunteerWorks,
  getAllVolunteerWorks,
  getVolunteersWithHours,
  updateVolunteerWork,
} from "../Controllers/volunteerWork.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // All routes require authentication

router
  .route("/")
  .post(
    upload.fields([{ name: "workFile", maxCount: 1 }]),
    createVolunteerWork
  );

// Both volunteer and user can access
router.route("/admin/").get(getAllVolunteerWorks);

// Only admin can access leaderboard and pending works
router
  .route("/admin/approvedVolunteerWorkWithHours")
  .get(authorizeRoles("ADMIN"), getVolunteersWithHours);

router
  .route("/admin/volunteerPendingWorks")
  .get(authorizeRoles("ADMIN"), getAllPendingVolunteerWorks);

router
  .route("/admin/:volunteerWorkId")
  .patch(authorizeRoles("ADMIN"), approveVolunteerWork);

router
  .route("/:volunteerWorkId")
  .patch(
    upload.fields([{ name: "workFile", maxCount: 1 }]),
    updateVolunteerWork
  )
  .delete(deleteVolunteerWork);

export default router;
