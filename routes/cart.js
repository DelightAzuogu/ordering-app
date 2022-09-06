const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../util/is-auth");
const cartController = require("../controllers/cart");

const router = express.Router();

router.post("/add-to-cart/:itemId", isAuth, cartController.postAddToCart);

router.get("/cart", isAuth, cartController.getCart);

module.exports = router;
