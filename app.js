const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoute = require("./routes/user");
const restRoute = require("./routes/restaurant");
const menuRoute = require("./routes/menu");

const app = express();

app.use(express.urlencoded());

app.use("/user", userRoute);
app.use("/restaurant", restRoute);
app.use("/menu-item", menuRoute);

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
