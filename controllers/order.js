const Cart = require("../model/cart");
const Order = require("../model/order");

exports.postOrder = async (req, res, next) => {
  try {
    const cartItems = await Cart.find({});
  } catch (err) {
    next(err);
  }
};
