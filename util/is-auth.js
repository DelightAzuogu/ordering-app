const jwt = require("jsonwebtoken");
const { Restaurant } = require("../model/restaurant");
const User = require("../model/user");
const newError = require("../util/error");
require("dotenv").config();

module.exports = async (req, res, next) => {
  let token = req.get("Authorization");
  if (!token) {
    const error = new Error("not authorized");
    error.status = 401;
    throw error;
  }

  token = token.split(" ")[1];
  let decryptToken;

  try {
    decryptToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.status = 401;
    next(err);
  }

  if (!decryptToken) {
    const error = new Error("verification failed");
    error.status = 401;
    throw error;
  }

  req.userId = decryptToken.id;

  const user = await User.findOne({ id: req.userId });
  if (!user) {
    const rest = await Restaurant.findOne({ id: req.userId });
    if (!rest) {
      throw newError("user not found", 400);
    }
  }

  next();
};
