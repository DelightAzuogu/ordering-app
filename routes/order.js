const express = require("express");
const { body } = require("express-validator");

const userAuth = require("../util/user-auth");
const restAuth = require("../util/rest-Auth");
const orderController = require("../controllers/order");

const router = express.Router();

router.post(
  "/order-all",
  [
    body("address").isAscii().not().isEmpty().trim(),
    body("city").isAscii().not().isEmpty().trim(),
  ],
  userAuth,
  orderController.postOrderAll
);

//order from only one rest
router.post(
  "/:restId",
  [
    body("address").isAscii().not().isEmpty().trim(),
    body("city").isAscii().not().isEmpty().trim(),
  ],
  userAuth,
  orderController.postRestOrder
);

//delete item from order(user)
router.delete(
  "/user-delete-item/:orderId/:itemId",
  userAuth,
  orderController.deleteOrderItem
);

//delete item from order (restaurant)
router.delete(
  "/restaurant-delete-item/:orderId/:itemId",
  restAuth,
  orderController.deleteOrderItem
);

//delete the full order(user)
router.delete("/user-delete-order/:orderId", userAuth);

module.exports = router;
