// import { app } from "./src/app.js";
// import connectDB from "./src/db/index.js";
// import dotenv from "dotenv";
// import { sendSMS } from "./src/utils/smsUtil.js";
// dotenv.config({ path: "./.env" });

// connectDB()
//   .then(() => {
//     app.on("error", (error) => {
//       console.log("express error", error);
//     });
//   })
//   .then(() => {
//     const PORT = process.env.PORT || 8000;
//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("MongoDB connection failed!!! ", err);
//     process.exit(1);
//   });


// sendMail();

// import express from "express";
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("express error", error);
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Connection error ", error);
//     throw error;
//   }
// })();



import { app } from "./src/app.js";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

let isConnected = false;

// Vercel serverless handler export
export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}

// For local development only: run app.listen if not running on Vercel
if (process.env.VERCEL !== "1") {
  connectDB()
    .then(() => {
      app.on("error", (error) => {
        console.log("express error", error);
      });
    })
    .then(() => {
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.log("MongoDB connection failed!!! ", err);
      process.exit(1);
    });
}
