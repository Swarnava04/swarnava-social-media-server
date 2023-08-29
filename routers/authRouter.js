const {
  signupController,
  loginController,
  refreshAccesTokenController,
  logoutController,
} = require("../controlllers/authController");

const router = require("express").Router();
router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/refresh", refreshAccesTokenController);
router.post("/logout", logoutController);
module.exports = router;
