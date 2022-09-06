const User = require("../model/user");
const Menu = require("../model/menu-item");
const Cart = require("../model/cart");

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
    const item = await Menu.findOne({ id: itemId });
    if (!item) {
      const err = new Error("menut Item not found");
      err.status = 400;
      throw err;
    }

    const restId = item.restaurantId;

    const createCart = {
      itemId,
      restaurantId: restId,
      UserId,
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
      const err = new Error("User not found");
      err.status = 400;
      throw err;
    }
    const cart = await Cart.find({ userId });

    res.status(200).json({ msg: "cart items", cart });
  } catch (err) {
    next(err);
  }
};
