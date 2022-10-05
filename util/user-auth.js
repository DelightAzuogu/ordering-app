const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { Restaurant } = require("../model/restaurant");
const User = require("../model/user");
const newError = require("./error");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    let token = req.get("Authorization");
    if (!token) {
      throw newError("not authorized", 401);
    }

    token = token.split(" ")[1];
    let decryptToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decryptToken) {
      throw newError("verification failed", 401);
    }

    req.userId = decryptToken.id;
    req.user_Id = ObjectId(req.userId);

    const user = await User.find({ _id: req.userId });
    if (!user) {
      throw newError("user not found", 400);
    }
    req.user = user;

    next();
  } catch (err) {
    err.status = err.status || 401;
    next(err);
  }
};
