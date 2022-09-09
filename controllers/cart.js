const User = require("../model/user");
const { MenuItem } = require("../model/menu-item");
const Cart = require("../model/cart");
const { Restaurant } = require("../model/restaurant");
const newError = require("../util/error");

exports.postAddToCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ id: userId });
    if (!user) {
      const err = new Error("User not found");
      err.status = 400;
      throw err;
    }

    const itemId = req.params.itemId;
    const item = await MenuItem.findOne({ id: itemId });
    if (!item) {
      throw newError("menu Item not found", 400);
    }

    const restId = item.restaurantId;
    const rest = await Restaurant.findOne({ id: restId });
    if (rest.status === false) {
      throw newError("offline", 409);
    }

    const createCart = {
      itemId,
      restaurantId: restId,
      userId,
    };

    const cart = await Cart.create(createCart);

    res.status(201).json({ msg: "added", cartId: cart.id });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw newError("User not found", 400);
    }
    const cart = await Cart.find({ userId });

    res.status(200).json({ msg: "cart items", cart });
  } catch (err) {
    next(err);
  }
};
