const Post = require("../models/Post");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const currUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow); //fetching the document of the user to be followed
    const currUser = await User.findById(currUserId);

    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }
    // console.log("Current userid is:-", currUser);
    // console.log("Given userid to follow is:- ", userIdToFollow);
    if (currUserId === userIdToFollow) {
      return res.send(error(409, "You cannot follow yourself"));
    }

    if (currUser.followings.includes(userIdToFollow)) {
      //already followed
      const followingIndex = currUser.followings.indexOf(userIdToFollow);
      currUser.followings.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(currUserId);
      userToFollow.followers.splice(followerIndex, 1);

      // return res.send(success(200, "User unfollowed"));
    } else {
      //not yet followed
      currUser.followings.push(userIdToFollow);
      userToFollow.followers.push(currUser);
      // return res.send(success(200, "User followed"));
    }
    await userToFollow.save();
    await currUser.save();
    // return res.send(success(200, { user: userIdToFollow }));
    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getPostsOfFollowingUserController = async (req, res) => {
  try {
    const currUserId = req._id;
    const currUser = await User.findById(currUserId).populate("followings");
    const fullPosts = await Post.find({
      owner: {
        $in: currUser.followings, //this checks whether the owner of the post is currently in following section of the currUser
      },
    }).populate("owner");
    // console.log("fullpost is", fullPosts);
    const posts = fullPosts.map((item) => mapPostOutput(item, req._id));
    // console.log("posts are", posts);
    // console.log(
    //   "the details of the current followers are",
    //   currUser.followings
    // );
    const followingIds = currUser.followings.map((eachUser) => {
      return eachUser._id;
    });
    // console.log(followingIds);
    followingIds.push(req._id);
    //this part is for suggestions
    const suggestions = await User.find({
      _id: {
        $nin: followingIds,
      },
    });
    // console.log("Following are:-", currUser.followings);

    // console.log("Suggestions are :-", suggestions);
    return res.send(success(200, { ...currUser._doc, suggestions, posts })); //adding suggestions and updating posts
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getMyPostsController = async (req, res) => {
  try {
    const currUserId = req._id; //will be fetched from the middleware
    const allUserPosts = await Post.find({
      owner: currUserId,
    }).populate("likes");
    return res.send(success(200, allUserPosts));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getUserPostsController = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.send(error(400, "UserId is required"));
    }
    const allUserPost = await Post.find({
      owner: userId,
    }).populate("likes");
    return res.send(success(200, allUserPost));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const deleteMyProfileController = async (req, res) => {
  try {
    const currUserId = req._id;
    const currUser = await User.findById(currUserId);
    //before deleting the , we need to clean the database

    //removing the likes
    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
      const index = post.likes.indexOf(currUserId);
      post.likes.splice(index, 1);
      await post.save();
    });

    //removing the followers and removing myself from the followers's following list
    currUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(currUserId);
      follower.followings.splice(index, 1);
      await follower.save();
    });
    //removing the following and removing myself from the following's follower list
    currUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(currUserId);
      following.followers.splice(index, 1);
      await following.save();
    });
    //deleteing all the posts
    await Post.deleteMany({
      owner: currUserId,
    });
    //deleting the refreshtoken from the backend and
    // the accesstoken from thefrontend and
    // removing the user
    await currUser.deleteOne();
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, currUser));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};
const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, user));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImage = await cloudinary.uploader.upload_large(userImg, {
        folder: "profileImg",
      });
      user.avatar = {
        url: cloudImage.secure_url,
        publicId: cloudImage.public_id,
      };
    }
    await user.save();
    return res.send(success(200, user));
  } catch (e) {
    return res.send(error(200, e.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    const fullPosts = user.posts;
    const posts = fullPosts.map((item) => mapPostOutput(item, req._id));
    console.log("just random check", posts);
    return res.send(success(200, { ...user._doc, posts })); //updating the posts field with the new format
    // res.send(success(200, "it is working"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowingUserController,
  getMyPostsController,
  getUserPostsController,
  deleteMyProfileController,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
