const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoute = require("./routes/user");
const restRoute = require("./routes/restaurant");
const menuRoute = require("./routes/menu");
const cartRoute = require("./routes/cart");
const database = require("./initDB");

const app = express();

app.use(express.urlencoded());

app.use("/user", userRoute);
app.use("/restaurant", restRoute);
app.use("/menu", menuRoute);
app.use("/order", cartRoute);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "server Error";
  const data = err.data;
  res.status(status).json({ message, data });
});

const PORT = process.env.PORT || 3000;

// database(() => {
//   app.listen(PORT, () => {
//     console.log("Server started on port " + PORT + "...");
//   });
// });

mongoose
  .connect(process.env.MONGODB_STRING)
  .then(() => {
    console.log("Mongodb connected....");
    app.listen(PORT, () => {
      console.log("Server started on port " + PORT + "...");
    });
  })
  .catch((err) => console.log(err));

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection is disconnected...");
});

// app.listen(PORT, () => {
//   database();
//   console.log("Server started on port " + PORT + "...");
// });
