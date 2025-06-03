//DONE
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";

// generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request from refreshToken");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Invalid refresh token in error catch box"
    );
  }
});

const registerUser = asyncHandler(async (req, res) => {
  // details
  const { fullName, email, password, number, role } = req.body;

  // validation
  if (
    [fullName, email, password, number, role].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists

  const existedUser = await User.findOne({ $or: [{ email }, { number }] });

  // check for image and LocalPath
//   const avatarLocalPath = await req.files?.avatar[0].path;
let avatarLocalPath;
if (
  req.files &&
  req.files.avatar &&
  Array.isArray(req.files.avatar) &&
  req.files.avatar.length > 0
) {
  avatarLocalPath = req.files.avatar[0].path;
} else {
  avatarLocalPath = undefined;
}


  if (existedUser) {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
    throw new ApiError(409, "User with email or number already exists");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required in local");
  }
  // upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // creating new User
  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    number,
    password,
    role,
  });

  // remove pass and refreshToken

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // return ApiResponse

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// const loginUser = asyncHandler(async (req, res) => {
//   // get user data
//   const { email, password } = req.body;

//   if (!email) {
//     throw new ApiError(400, "username or email is required");
//   }

//   // find user from username or email
//   const user = await User.findOne({
//     email,
//   });

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   // pass check
//   const isPasswordValid = await user.isPasswordCorrect(password);
//   // const isPasswordValid = await user.comparePassword(password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid Credentials");
//   }

//   // generate Access and Refresh Token
//   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
//     user._id
//   );

//   // removing pass and refreshToken
//   const loggedInUser = await User.findById(user._id).select(
//     "-password -refreshToken -accessToken"
//   );

//   // cookie sending

//   const options = {
//     httpOnly: true,
//     secure: true,
//   }; // can only be modified through server and not from frontend

//   // res sending
//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: loggedInUser,
//           accessToken,
//         },
//         "User logged in Successfully"
//       )
//     );
// });

const loginUser = asyncHandler(async (req, res) => {
  // get user data
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "username or email is required");
  }

  // find user from username or email
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // pass check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  // generate Access and Refresh Token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // removing pass and refreshToken
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -accessToken"
  );

  // --- UPDATED COOKIE OPTIONS FOR LOCALHOST ---
  const options = {
    httpOnly: true,
    secure: false, // false for localhost (true for HTTPS in production)
    sameSite: "lax",
    path: "/",
  };

  // res sending
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged in Successfully"
      )
    );
});

//logout logic
const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { refreshToken: undefined },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error) {
    throw new ApiError(501, "Something went wrong in logout func");
  }
});


// console.log("req.user:", req.user);
// become volunteer
const becomeVolunteer = asyncHandler(async (req, res) => {
  // console.log(req.user);
  console.log("req.user:", req.user);
  const userId = req.user._id;
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ApiError(401, "User not found");
  }

  if (existingUser.role === "volunteer") {
    const error = new ApiError(409, "User is already a volunteer");
    return res.status(error.statusCode).json(error);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        role: "volunteer",
      },
    },
    {
      new: true,
    }
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User role updated to volunteer"));
});

export {
  registerUser,
  refreshAccessToken,
  loginUser,
  logoutUser,
  becomeVolunteer,
};


// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/apiError.js";
// import { User } from "../models/user.model.js";
// import {
//   deleteFromCloudinary,
//   uploadOnCloudinary,
// } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/apiResponse.js";
// import fs from "fs";
// import jwt from "jsonwebtoken";

// // Generate access and refresh tokens
// const generateAccessAndRefreshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = await user.generateAccessToken();
//     const refreshToken = await user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Something went wrong while generating access and refresh tokens"
//     );
//   }
// };

// // Refresh access token
// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const incomingRefreshToken =
//     req.cookies.refreshToken || req.body.refreshToken;

//   if (!incomingRefreshToken) {
//     throw new ApiError(401, "Unauthorized request from refreshToken");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       throw new ApiError(401, "Invalid access token");
//     }

//     if (incomingRefreshToken !== user?.refreshToken) {
//       throw new ApiError(401, "Refresh token is expired or used");
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     const { accessToken, refreshToken: newrefreshToken } =
//       await generateAccessAndRefreshTokens(user._id);

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", newrefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           {
//             accessToken,
//             refreshToken: newrefreshToken,
//           },
//           "Access Token refreshed"
//         )
//       );
//   } catch (error) {
//     throw new ApiError(
//       401,
//       error?.message || "Invalid refresh token in error catch box"
//     );
//   }
// });

// // Register user
// const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, email, password, number, role } = req.body;

//   // validation
//   if (
//     [fullName, email, password, number, role].some(
//       (field) => field?.trim() === ""
//     )
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   // check if user already exists
//   const existedUser = await User.findOne({ $or: [{ email }, { number }] });

//   // check for image and LocalPath
//   let avatarLocalPath;
//   if (
//     req.files &&
//     req.files.avatar &&
//     Array.isArray(req.files.avatar) &&
//     req.files.avatar.length > 0
//   ) {
//     avatarLocalPath = req.files.avatar[0].path;
//   } else {
//     avatarLocalPath = undefined;
//   }

//   if (existedUser) {
//     if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
//     throw new ApiError(409, "User with email or number already exists");
//   }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required in local");
//   }

//   // upload to cloudinary
//   const avatar = await uploadOnCloudinary(avatarLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   // creating new User
//   const user = await User.create({
//     fullName,
//     email,
//     avatar: avatar.url,
//     number,
//     password,
//     role,
//   });

//   // remove pass and refreshToken
//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );

//   // check for user creation
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User registered successfully"));
// });

// // Login user
// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email) {
//     throw new ApiError(400, "username or email is required");
//   }

//   // find user from username or email
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   // password check
//   const isPasswordValid = await user.isPasswordCorrect(password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid Credentials");
//   }

//   // generate Access and Refresh Token
//   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
//     user._id
//   );

//   // removing pass and refreshToken
//   const loggedInUser = await User.findById(user._id).select(
//     "-password -refreshToken -accessToken"
//   );

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: loggedInUser,
//           accessToken,
//         },
//         "User logged in Successfully"
//       )
//     );
// });

// // Logout user
// const logoutUser = asyncHandler(async (req, res) => {
//   try {
//     await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         $set: { refreshToken: undefined },
//       },
//       {
//         new: true,
//       }
//     );

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     return res
//       .status(200)
//       .clearCookie("accessToken", options)
//       .clearCookie("refreshToken", options)
//       .json(new ApiResponse(200, {}, "User logged out"));
//   } catch (error) {
//     throw new ApiError(501, "Something went wrong in logout func");
//   }
// });

// // Become volunteer
// const becomeVolunteer = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const existingUser = await User.findById(userId);
//   if (!existingUser) {
//     throw new ApiError(401, "User not found");
//   }

//   if (existingUser.role === "volunteer") {
//     const error = new ApiError(409, "User is already a volunteer");
//     return res.status(error.statusCode).json(error);
//   }
//   const user = await User.findByIdAndUpdate(
//     userId,
//     {
//       $set: {
//         role: "volunteer",
//       },
//     },
//     {
//       new: true,
//     }
//   );
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "User role updated to volunteer"));
// });

// export {
//   registerUser,
//   refreshAccessToken,
//   loginUser,
//   logoutUser,
//   becomeVolunteer,
// };
