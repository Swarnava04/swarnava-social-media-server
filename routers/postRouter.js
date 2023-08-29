const router = require("express").Router();
const getAllPostsController = require("../controlllers/postController");
const requireUser = require("../middlewares/requireUser");

router.post("/all", requireUser, getAllPostsController.getAllPostsController);
router.post("/", requireUser, getAllPostsController.createPostController);
router.post("/like", requireUser, getAllPostsController.likeAndUnlikePost);
router.put("/update", requireUser, getAllPostsController.updatePostController);
router.post("/delete", requireUser, getAllPostsController.deletePostController);
module.exports = router;
