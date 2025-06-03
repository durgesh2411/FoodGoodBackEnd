// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({
//   storage,
// });

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp on Vercel, ./public/temp locally
    const dest = process.env.VERCEL === "1" ? "/tmp" : "./public/temp";
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
