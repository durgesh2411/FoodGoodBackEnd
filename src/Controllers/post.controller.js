import { isValidObjectId } from "mongoose";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//done
const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!(req.user.role === "volunteer")) {
    throw new ApiError(400, "You do not have permission to create a post");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const post = await Post.create({
    content,
    owner: req.user._id,
    fullName: req.user.fullName,
  });

  if (!post) {
    throw new ApiError(500, "Post creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, post, "Post created successfully"));
});

//done
const getAllApprovedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "approved" });
  res
    .status(200)
    .json(new ApiResponse(200, { posts }, "Posts fetched successfully"));
});

//done
const getAllPendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "pending" });
  res
    .status(200)
    .json(new ApiResponse(200, { posts }, "Posts fetched successfully"));
});

// done
const getVolunteerPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ owner: req.user._id });
  res
    .status(200)
    .json(
      new ApiResponse(200, { posts }, "Volunteer posts fetched successfully")
    );
});

//done
const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    if (!isValidObjectId(postId)) {
      throw new ApiError(401, "Post not found");
    }

    if (!content) {
      throw new ApiError(400, "Content is required");
    }
    const post = await Post.findById(postId);
    if (req.user._id.toString() !== post.owner.toString()) {
      throw new ApiError(400, "You do not have permission to update the post.");
    }

    const newpost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(201, newpost, "Post updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
// done
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Post Id is not valid");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(400, "Could not find the post to be deleted");
  }
  if (!(req.user._id.equals(post.owner) || req.user.isAdmin)) {
    throw new ApiError(400, "You do not have permission to delete the post");
  }

  await Post.findByIdAndDelete({ _id: postId });
  return res
    .status(200)
    .json(new ApiResponse(201, null, "Post deleted successfully."));
});

//done
const approvePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Post Id is not valid");
  }

  if (!req.user.isAdmin) {
    throw new ApiError(400, "You do not have permission to approve the post");
  }

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $set: {
        status: "approved",
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(201, post, "Post approved successfully"));
});

export {
  createPost,
  updatePost,
  deletePost,
  getAllApprovedPosts,
  getAllPendingPosts,
  getVolunteerPosts,
  approvePost,
};
