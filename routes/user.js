const express = require("express");
const { body } = require("express-validator");

const User = require("../model/user");
const userController = require("../controllers/user");
const isAuth = require("../util/is-auth");

const router = express.Router();

//signup user put route
router.put(
  "/signup",
  [
    body("firstname").isAlpha().withMessage("invalid name"),
    body("lastname").isAlpha().withMessage("invalid name"),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("email already exists");
          }
        });
      })
      .normalizeEmail()
      .trim(),
    body("password").trim().isLength({ min: 5 }),
  ],
  userController.putSignupUser
);

//login user post route
router.post(
  "/login",
  [
    body("password").trim().isLength({ min: 5 }),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .trim()
      .normalizeEmail()
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("email address doesn't exists!");
          }
        });
      }),
  ],
  userController.postLoginUser
);

router.put(
  "/edit",
  [
    body("firstname").isAlpha().withMessage("invalid name"),
    body("lastname").isAlpha().withMessage("invalid name"),
    body("password").trim().isLength({ min: 5 }),
  ],
  isAuth,
  userController.putEditUser
);

module.exports = router;
