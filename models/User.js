const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, //ensures the password in hidden
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      //for the profile image of the user
      publicID: String, //will be uploading on cloudinary platform
      url: String,
    },
    bio: {
      type: String,
    },
    followers: [
      //array of object ids
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    followings: [
      //array of object ids
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
