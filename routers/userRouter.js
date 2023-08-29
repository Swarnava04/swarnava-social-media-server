const {
  followOrUnfollowUserController,
  getPostsOfFollowingUserController,
  getMyPostsController,
  getUserPostsController,
  deleteMyProfileController,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
} = require("../controlllers/userController");
const requireUser = require("../middlewares/requireUser");

const router = require("express").Router();

router.post("/follow", requireUser, followOrUnfollowUserController);
router.get("/getFeedData", requireUser, getPostsOfFollowingUserController);
router.get("/getMyPosts", requireUser, getMyPostsController);
router.get("/getUserPosts", requireUser, getUserPostsController);
router.get("/deleteMyProfile", requireUser, deleteMyProfileController);
router.get("/getMyInfo", requireUser, getMyInfo);
router.put("/updateUserProfile", requireUser, updateUserProfile);
router.post("/getUserProfile", requireUser, getUserProfile);
module.exports = router;
