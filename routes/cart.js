const express = require("express");
const { body } = require("express-validator");

const userAuth = require("../util/user-auth");
const cartController = require("../controllers/cart");

const router = express.Router();

//add item
router.post(
  "/add-to-cart/:itemId",
  [body("quantity").isInt({ gt: 0 }).trim()],
  userAuth,
  cartController.postAddToCart
);

//increase quanity by one
router.post("/add-quantity/:itemId", userAuth, cartController.postAddQuantity);

//decrease the quantity  by one
router.post(
  "/remove-quantity/:itemId",
  userAuth,
  cartController.postRemoveQuantity
);

//delete an item from the cart
router.delete("/delete-item/:itemId", userAuth, cartController.deleteCartItem);

//get cart
router.get("/", userAuth, cartController.getCart);

module.exports = router;
