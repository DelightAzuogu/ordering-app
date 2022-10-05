const express = require("express");
const { body } = require("express-validator");

const restaurantController = require("../controllers/restaurant");
const { Restaurant } = require("../model/restaurant");
const restAuth = require("../util/rest-Auth");

const router = express.Router();

//signup for restu
router.put(
  "/signup",
  [
    body("name"),
    body("phone")
      .isNumeric({ no_symbols: false })
      .withMessage("invalid phone number"),
    body("password").trim().isLength({ min: 5 }),
    body("confirmPassword").trim().isLength({ min: 5 }),
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
  restaurantController.putSignupRest
);

//login for resturants
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
        return Restaurant.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("email address doesn't exists!");
          }
        });
      }),
  ],
  restaurantController.postLoginRest
);

//edit route
router.put(
  "/edit",
  restAuth,
  [
    body("name"),
    body("phone")
      .isNumeric({ no_symbols: false })
      .withMessage("invalid phone number"),
  ],
  restaurantController.putEditRestaurant
);

//check password
router.get(
  "/check-password",
  body("password").trim().isLength({ min: 5 }),
  restAuth,
  restaurantController.getCheckPassword
);

router.delete("/", restAuth, restaurantController.deleteRestaurant);

router.get("/:id", restaurantController.getRestaurant);

module.exports = router;
