const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./dbConnect");
const authRouter = require("./routers/authRouter");
const postRouter = require("./routers/postRouter");
const userRouter = require("./routers/userRouter");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;

//setting the path for enviroment variables
dotenv.config("./.env");

const cors = require("cors");

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

//middlewares
app.use(express.json({ limit: "10mb" }));
app.use(morgan("common"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  console.log("The server is up and running");
  res.status(200).send("The server is running");
});

dbConnect();
const PORT = process.env.PORT;
app.listen(PORT, () => {
  //setting up the most basic server side system
  console.log(`listening on port ${PORT}`);
});
