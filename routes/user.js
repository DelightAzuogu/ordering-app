const express = require("express");
const { body } = require("express-validator");

const User = require("../model/user");
const userController = require("../controllers/user");
const userAuth = require("../util/user-auth");

const router = express.Router();

//signup user put route
router.put(
  "/signup",
  [
    body("firstname").isAlpha().withMessage("invalid name").trim(),
    body("lastname").isAlpha().withMessage("invalid name").trim(),
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
    body("password").trim().isLength({ min: 5 }).trim(),
    body("confirmPassword").trim().isLength({ min: 5 }).trim(),
    body("phone").isNumeric().trim(),
    body("address").isAlphanumeric().trim(),
    body("city").trim(),
  ],
  userController.putSignupUser
);

//login user post route
router.post(
  "/login",
  [
    body("password").trim().isLength({ min: 5 }).trim(),
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

//edit details
router.put(
  "/edit",
  [
    body("firstname").isAlpha().withMessage("invalid name").trim(),
    body("lastname").isAlpha().withMessage("invalid name").trim(),
    body("phone").isNumeric().trim(),
  ],
  userAuth,
  userController.putEditUserDetails
);

//confirm password
router.post(
  "/check-password",
  [body("password").trim().isLength({ min: 5 })],
  userAuth,
  userController.postConfirmPassword
);

module.exports = router;
