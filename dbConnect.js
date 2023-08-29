const mongoose = require("mongoose");
module.exports = async () => {
  const mongoUrl =
    "mongodb+srv://swarnavachakrabarti02:RDfboNa8PlLIhWxv@cluster0.wia0qbo.mongodb.net/?retryWrites=true&w=majority";
  try {
    const connect = await mongoose.connect(
      mongoUrl
      // {
      //   serverApi: {
      //     version: ServerApiVersion.v1,
      //     strict: true,
      //     deprecationErrors: true,
      //   },
      // }
    );
    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
