const express = require("express");
const { body } = require("express-validator");

const User = require("../model/user");
const authController = require("../controllers/auth");
const { Restaurant } = require("../model/restaurant");

const router = express.Router();

//signup user put route
router.put(
  "/signup/user",
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
  authController.putSignupUser
);

//signup for restu
router.put(
  "/signup/restaurant",
  [
    body("name").isAlpha().withMessage("invalid name"),
    body("address")
      .isAlpha()
      .withMessage("invalid address")
      .isLength({ max: 50 })
      .withMessage("exceed length"),
    body("phone")
      .isNumeric({ no_symbols: false })
      .withMessage("invalid phone number"),
    body("password").trim().isLength({ min: 5 }),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .trim()
      .custom((value) => {
        return Restaurant.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("email address already exists!");
          }
        });
      }),
  ],
  authController.putSignupRest
);

//login user post route
router.post(
  "/login/user",
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
  authController.postLoginUser
);

//login for resturants
router.post(
  "/login/restaurant",
  [
    body("password").trim().isLength({ min: 5 }),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .trim()
      .normalizeEmail()
      .custom((value) => {
        return Restaurant.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("email address doesn't exists!");
          }
        });
      }),
  ],
  authController.postLoginRest
);

module.exports = router;
