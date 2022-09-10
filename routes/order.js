const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../util/is-auth");
const cartController = require("../controllers/cart");

const router = express.Router();

router.post("/order", isAuth);

module.exports = router;
