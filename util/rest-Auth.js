const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { Restaurant } = require("../model/restaurant");
const newError = require("../util/error");
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

    req.restId = decryptToken.id;
    req.rest_Id = ObjectId(req.restId);

    const rest = await Restaurant.findOne({ _id: req.restId });
    if (!rest) {
      throw newError("user not found", 400);
    }

    next();
  } catch (err) {
    err.status = err.status || 401;
    next(err);
  }
};
