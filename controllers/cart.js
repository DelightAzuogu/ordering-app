const User = require("../model/user");
const { MenuItem } = require("../model/menu-item");
const Cart = require("../model/cart");
const { Restaurant } = require("../model/restaurant");
const newError = require("../util/error");
const ValErrorCheck = require("../util/validationError");

// this check for the existence of the user and the item in the database
const userItemcheck = async (req) => {
  const userId = req.userId;
  const user = await User.findOne({ id: userId });
  if (!user) {
    return newError("user not found", 400);
  }

  const itemId = req.params.itemId;
  const item = await MenuItem.findOne({ id: itemId });
  if (!item) {
    return newError("menu Item not found", 400);
  }

  return true;
};

// adds to the cart
exports.postAddToCart = async (req, res, next) => {
  try {
    const valErr = ValErrorCheck(req);
    if (valErr) {
      throw valErr;
    }

    const check = await userItemcheck(req);
    if (check !== true) {
      throw check;
    }
    const itemId = req.params.itemId;
    const userId = req.userId;

    const item = await MenuItem.findOne({ id: itemId });

    const cartItem = await Cart.findOne({
      itemId,
      userId,
    });
    //increase the quantity if the item is already in the cart
    if (cartItem) {
      cartItem.quantity += Number(req.body.quantity);
      await cartItem.save();
      res.status(201).json({ msg: "added" });
      return;
    }

    //check for existence of restaurant
    const restId = item.restaurantId;
    const rest = await Restaurant.findOne({ id: restId });
    if (rest.status === false) {
      throw newError("offline", 409);
    }

    //create the cart
    const createCart = {
      itemId,
      restaurantId: restId,
      userId,
      quantity: req.body.quantity,
      item,
    };

    const cart = await Cart.create(createCart);

    res.status(201).json({ msg: "added", cartId: cart.id });
  } catch (err) {
    next(err);
  }
};

//get the items in a users cart
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

exports.postAddQuantity = async (req, res, next) => {
  try {
    const check = await userItemcheck(req);
    if (check !== true) {
      throw check;
    }
    const itemId = req.params.itemId;
    const userId = req.userId;

    const cartItem = await Cart.findOne({ itemId, userId });

    if (!cartItem) {
      throw newError("cart item not found", 400);
    }

    cartItem.quantity++;
    await cartItem.save();
    res.status(201).json({ msg: "increased" });
  } catch (err) {
    next(err);
  }
};

//delete item from a users cart
exports.deleteCartItem = async (req, res, next) => {
  try {
    const check = await userItemcheck(req);
    if (check !== true) {
      throw check;
    }
    const itemId = req.params.itemId;
    const userId = req.userId;

    const cartItem = await Cart.findOneAndDelete({ itemId, userId });

    if (!cartItem) {
      throw newError("cart item not found", 400);
    }

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};
