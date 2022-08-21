const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
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

  if (!decodedToken) {
    const error = new Error("verification failed");
    error.status = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
