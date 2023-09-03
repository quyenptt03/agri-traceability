import mongoose from "mongoose";

const connectDB = (url: string) => {
  return mongoose
    .connect(url)
    .then(() => console.log("connect db successfull"))
    .catch((err) => console.log("error", err));
};

export default connectDB;
