const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const path = require("path");
const app = express();

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images"); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + "-" + file.originalname); // Set the filename to avoid conflicts
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//general error handling functionality
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS,GET,POST,PUT,PATCH,DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

mongoose
  .connect(
    "mongodb+srv://saradchhetri20690:pepsodent123@cluster0.ovdewcq.mongodb.net/"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);
