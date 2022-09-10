const express = require("express");
const { body } = require("express-validator");

const userAuth = require("../util/user-auth");
const cartController = require("../controllers/cart");

const router = express.Router();

router.post(
  "/add-to-cart/:itemId",
  [body("quantity").isNumeric().withMessage("invalid quantity")],
  userAuth,
  cartController.postAddToCart
);

router.post("/add-quantity/:itemId", userAuth, cartController.postAddQuantity);

router.get("/cart", userAuth, cartController.getCart);

router.delete("/delete-item/:itemId", userAuth, cartController.deleteCartItem);

module.exports = router;
