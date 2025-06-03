import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB Host : ${connectionInstance.connection.host}`,
      DB_NAME
    );
  } catch (error) {
    console.log("MONGODB error ", error);
    process.exit(1);
  }
};

export default connectDB;
