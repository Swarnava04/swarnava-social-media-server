// const express = require("express");

const Post = require("../models/Post");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;
const { success, error } = require("../utils/responseWrapper");

// const { model } = require('mongoose');
const getAllPostsController = async (req, res) => {
  console.log(req._id);
  return res.send(success(200, "These are all the posts"));
};

const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;
    if (!caption || !postImg) {
      return res.send(
        error(400, "Caption and post image details are both required")
      );
    }

    const owner = req._id; //fetching from the middleware
    const user = await User.findById(req._id);
    if (postImg) {
      const cloudImg = await cloudinary.uploader.upload(postImg, {
        folder: "postImages",
      });
      const post = await Post.create({
        owner,
        caption,
        image: {
          publicId: cloudImg.public_id,
          url: cloudImg.secure_url,
        },
      });
      user.posts.push(post._id);
      await user.save();
      return res.send(success(200, post));
    }
  } catch (e) {
    console.log(e);
    res.send(error(500, e.message));
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id; //this will come from the middleware
    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      return res.send(error(404, "Post not found"));
    }
    if (post.likes.includes(currUserId)) {
      const index = post.likes.indexOf(currUserId);
      post.likes.splice(index, 1);
      // await post.save();
      // return res.send(success(200, "Post Unliked"));
    } else {
      post.likes.push(currUserId);
      // await post.save();
      // return res.send(success(200, "Post liked"));
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, newCaption } = req.body;
    const currUserId = req._id;

    const post = await Post.findById(postId);
    if (!postId) {
      return res.send(error(404, "Post not found"));
    }

    if (post.owner.toString() !== currUserId) {
      return res.send(error(403, "Only owners can update their posts"));
    }
    if (newCaption) {
      post.caption = newCaption;
    }
    await post.save();
    return res.send(success(200, post));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const deletePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id;
    const post = await Post.findById(postId);
    console.log(post);
    const currUser = await User.findById(currUserId);
    console.log(currUser);
    if (!post) {
      return res.send(error(403, "Post not found"));
    }
    if (post.owner.toString() !== currUserId) {
      return res.send(error(403, "Only owners can delete their posts"));
    }

    const index = currUser.posts.indexOf(postId);
    currUser.posts.splice(index, 1);
    await currUser.save();
    await post.deleteOne(); //deleteOne is used to delete one document

    return res.send(success(200, post));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};
module.exports = {
  getAllPostsController,
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePostController,
};
