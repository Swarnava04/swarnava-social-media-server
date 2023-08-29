const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");
const signupController = async (req, res) => {
  try {
    // res.send("from signup");
    const { name, email, password } = req.body;
    // console.log(req.body);
    // console.log(name, email, password);
    if (!name || !email || !password) {
      //if the email and the password shared are not there in the database
      // res.status(403).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      // return res.status(409).send("email already registered");
      return res.send(error(409, "User is already registered"));
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });
    // return res.status(201).json({ user });
    return res.send(success(201, user));
  } catch (e) {
    console.log(e);
    res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  // res.send("from login");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }
    // const user = await User.findOne({ email });
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // res.status(404).send("User is not registered");
      return res.send(error(404, "User is not registered"));
    }
    console.log("User is :-", user);
    // const hashPassword = bcrypt.hash(user.password, 10);
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      // res.status(403).send("Wrong password");
      return res.send(error(403, "Wrong password"));
    }
    const accesstoken = generateAccessToken({
      _id: user._id,
      email: user.email,
      password: user.password,
    });
    const refreshtoken = generateRefreshToken({
      _id: user._id,
      email: user.email,
      password: user.password,
    });
    console.log("Access token is ", accesstoken);
    console.log("Refresh token is ", refreshtoken);
    // res.json({accesstoken,refreshtoken});
    res.cookie("jwt", refreshtoken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, accesstoken));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    res.send(success(200, "user logged out"));
  } catch (e) {
    console.log(e);
    res.send(error(500, e.message));
  }
};

//internal functions
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(
      data,
      // "asdflkjhasdflkkkkjqweproiuqweropiuqwerqwertpoiuy"
      process.env.ACCESS_TOKEN_PRIVATE_KEY,
      {
        expiresIn: "1d",
      }
    );
    // console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
};
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(
      data,
      // "asdflkjhasdflkkkkjqweproiuqweropiuqwerqwertpoiuy"
      process.env.REFRESH_TOKEN_PRIVATE_KEY,
      {
        expiresIn: "1y",
      }
    );
    // console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
};

//this api will check the validity of the refresh token and it will generate a new access token if the access token has expired
const refreshAccesTokenController = async (req, res) => {
  try {
    // const { refreshtoken } = req.body;
    const cookies = req.cookies;
    if (!cookies.jwt) {
      // res
      //   .status(401)
      //   .send("Refresh token is not found and hence it is required");
      res.send(error(401, "refresh token is required"));
    }
    // if(!refreshtoken){
    // res.send('Refreshtoken in required')
    // }
    refreshtoken = cookies.jwt;
    const verified = jwt.verify(
      refreshtoken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = verified._id;
    const email = verified.email;
    const password = verified.password;
    const newAccessToken = generateAccessToken({ _id, email, password });
    // return res.json({
    //   newAccessToken,
    // });
    return res.send(success(200, newAccessToken));
  } catch (e) {
    console.log(e);
    // res.status(403).send("Inavalid Refresh Token");
    res.send(error(401, "Invalid refresh token"));
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccesTokenController,
  logoutController,
};
