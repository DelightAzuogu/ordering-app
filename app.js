const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoute = require("./routes/user");
const restRoute = require("./routes/restaurant");
const menuRoute = require("./routes/menu-item");
const cartRoute = require("./routes/cart");
const database = require("./initDB");

const app = express();

app.use(express.urlencoded());

app.use("/user", userRoute);
app.use("/restaurant", restRoute);
app.use("/menu", menuRoute);
app.use("/cart", cartRoute);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || "server Error";
  const data = err.data;
  res.status(status).json({ message, data });
});

const PORT = process.env.PORT || 3000;

database(() => {
  app.listen(PORT, () => {
    console.log("Server started on port " + PORT + "...");
  });
});
