const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../util/is-auth");
const cartController = require("../controllers/cart");

const router = express.Router();

router.post(
  "/add-to-cart/:itemId",
  [body("quantity").isNumeric().withMessage("invalid quantity")],
  isAuth,
  cartController.postAddToCart
);

router.post("/add-quantity/:itemId", isAuth, cartController.postAddQuantity);

router.get("/cart", isAuth, cartController.getCart);

router.delete("/delete-item/:itemId", isAuth, cartController.deleteCartItem);

module.exports = router;
