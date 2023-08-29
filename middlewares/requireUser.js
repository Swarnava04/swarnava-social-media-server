const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");
const User = require("../models/User");
module.exports = async (req, res, next) => {
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    res.send(error(401, "Authorization header required"));
  }
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    console.log(accessToken);
    // const decoded = jwt.decode(accessToken);
    // console.log(decoded);
    const verified = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    console.log(verified);
    req._id = verified._id;
    const user = User.findById(req._id);
    if (!user) {
      return res.send(error(404, "User not found"));
    }
    next();
  } catch (e) {
    console.log(e);
    return res.send(error(401, "Invalid access key"));
    // return res.status(401).send("Invalid access key");
  }
};
