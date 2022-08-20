const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoute = require("./routes/auth");

const app = express();

app.use(express.urlencoded());

app.use("/auth", authRoute);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "server Error";
  const data = err.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect(
    "mongodb+srv://delight:Password@cluster0.uzytt77.mongodb.net/ordering-app?retryWrites=true&w=majority"
  )
  .then((client) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
