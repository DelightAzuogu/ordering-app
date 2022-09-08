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
app.use("/cart", cartRoute);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || "server Error";
  const data = err.data;
  res.status(status).json({ message, data });
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect("mongodb://localhost:27017/ordering-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
