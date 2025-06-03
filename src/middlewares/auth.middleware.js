// // import jwt from "jsonwebtoken";
// // import { ApiError } from "../utils/apiError.js";
// // import { asyncHandler } from "../utils/asyncHandler.js";
// // import { User } from "../models/user.model.js";

// // export const verifyJWT = asyncHandler(async (req, res, next) => {
// //   try {
// //    //  const token =
// //    //    req.cookies?.accessToken ||
// //    //    req.header("Authorization")?.replace("Bearer ", "");


// //     if (!token) {
// //       throw new ApiError(401, "Unauthorised request");
// //     }

// //     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

// //     const user = await User.findById(decodedToken?._id).select(
// //       "-password -refreshToken"
// //     );

// //     if (!user) {
// //       throw new ApiError(401, "Invalid access token");
// //     }

// //     req.user = user;
// //     next();
// //   } catch (error) {
// //     throw new ApiError(
// //       401,
// //       error.message || "Invalid access token in error catch box"
// //     );
// //   }
// // });

// import jwt from "jsonwebtoken";
// import { ApiError } from "../utils/apiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { User } from "../models/user.model.js";

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     // Get token from cookies or Authorization header
//     let token = req.cookies?.accessToken;
//     if (!token && req.headers.authorization) {
//       const authHeader = req.headers.authorization;
//       if (authHeader.startsWith("Bearer ")) {
//         token = authHeader.substring(7).trim();
//       }
//     }

//     if (!token) {
//       throw new ApiError(401, "Unauthorised request");
//     }

//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decodedToken?._id).select(
//       "-password -refreshToken"
//     );

//     if (!user) {
//       throw new ApiError(401, "Invalid access token");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     throw new ApiError(
//       401,
//       error.message || "Invalid access token in error catch box"
//     );
//   }
// });

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      throw new ApiError(401, "Unauthorised request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      error.message || "Invalid access token in error catch box"
    );
  }
});

// Add this function for role-based authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};
