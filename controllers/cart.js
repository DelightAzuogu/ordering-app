const mongoose = require("mongoose");

const User = require("../model/user");
const { MenuItem } = require("../model/menu-item");
const { Cart } = require("../model/cart");
const { Restaurant } = require("../model/restaurant");
const newError = require("../util/error");
const ValErrorCheck = require("../util/validationError");
const { ObjectId } = require("mongodb");

//add to cart
exports.postAddToCart = async (req, res, next) => {
  try {
    const valErr = ValErrorCheck(req);
    if (valErr) {
      throw valErr;
    }

    const itemId = req.params.itemId;
    const quantity = Number(req.body.quantity);

    //check for the menu item
    const menuItem = await MenuItem.findOne({ _id: ObjectId(itemId) });
    if (!menuItem) {
      throw newError("item not found", 400);
    }

    //check for cart item
    const cart = await Cart.findOne({
      restaurantId: menuItem.restaurantId,
      userId: req.userId,
    });

    if (cart) {
      //checking if the item is already in the cart
      if (cart.items.some((value) => value.itemId == itemId)) {
        let newItemPrice;
        //updateing the price of the item
        cart.items = cart.items.map((value) => {
          if (value.itemId == itemId) {
            let itemQuantity = value.quantity + quantity;

            //this is the change the price of the entire restaurant cart
            cart.price -= value.price;
            newItemPrice = menuItem.price * itemQuantity;
            cart.price += newItemPrice;

            const item = {
              quantity: itemQuantity,
              price: newItemPrice,
              itemId: itemId,
            };
            return item;
          } else {
            return value;
          }
        });

        await cart.save();
        res.status(201).json({ msg: "increased" });
      } else {
        //pushin the item to cart if it wasnt there
        const price = menuItem.price * quantity;
        cart.items.push({
          itemId,
          quantity,
          price,
        });

        //updateing the cart price
        cart.price += price;
        cart.save();
        res.status(201).json({ msg: "added" });
      }
    } else {
      const price = menuItem.price * quantity;
      Cart.create({
        userId: req.userId,
        restaurantId: menuItem.restaurantId,
        price,
        items: [{ itemId, quantity, price }],
      });
      res.status(201).json({ msg: "added" });
    }
  } catch (err) {
    next(err);
  }
};

//increase quanit by one
exports.postAddQuantity = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    //check for item in menu
    const menuItem = await MenuItem.findOne({ _id: ObjectId(itemId) });
    if (!menuItem) {
      throw newError("item not found", 400);
    }

    //check for user cart
    const cart = await Cart.findOne({
      userId: req.userId,
      restaurantId: menuItem.restaurantId,
    });
    if (!cart) {
      throw newError("cart not found", 400);
    }

    cart.items = cart.items.map((value) => {
      if (value.itemId == itemId) {
        //change the cart price
        cart.price += menuItem.price;
        return {
          itemId,
          quantity: value.quantity + 1,
          price: value.price + menuItem.price,
        };
      } else {
        return value;
      }
    });
    cart.save();
    res.status(201).json({ msg: "increased" });
  } catch (err) {
    next(err);
  }
};

//decrease quantity by one
exports.postRemoveQuantity = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    //check for item in menu
    const menuItem = await MenuItem.findOne({ _id: ObjectId(itemId) });
    if (!menuItem) {
      throw newError("item not found", 400);
    }

    //check for user cart
    const cart = await Cart.findOne({
      userId: req.userId,
      restaurantId: menuItem.restaurantId,
    });
    if (!cart) {
      throw newError("cart not found", 400);
    }

    cart.items = cart.items.map((value) => {
      if (value.itemId == itemId) {
        //change the cart price
        cart.price -= menuItem.price;

        return {
          itemId,
          quantity: value.quantity - 1,
          price: value.price - menuItem.price,
        };
      } else {
        return value;
      }
    });

    cart.items = cart.items.filter((value) => {
      if (value.quantity == 0) {
        return false;
      } else {
        return true;
      }
    });

    if (cart.items.length == 0) {
      await Cart.deleteOne({ _id: cart._id });
      res.status(201).json({ msg: "item deleted" });
    } else {
      cart.save();
      res.status(201).json({ msg: "decreased" });
    }
  } catch (err) {
    next(err);
  }
};

//delete item from a users cart
exports.deleteCartItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    //check for menu item
    const menuItem = await MenuItem.findOne({ _id: ObjectId(itemId) });
    if (!menuItem) {
      return newError("menu Item not found", 400);
    }

    //check for cart item
    // const cartItem = await Cart.findOneAndDelete({ itemId, userId });
    const cartItem = await Cart.findOne({
      userId: req.userId,
      restaurantId: menuItem.restaurantId,
    });
    if (!cartItem) {
      throw newError("no cart item", 400);
    }

    //chack to delete the item from cart
    cartItem.items = cartItem.items.filter((value) => {
      if (value.itemId != itemId) {
        return true;
      } else {
        cartItem.price -= value.price;
        return false;
      }
    });

    //check to delte the cart if not items are inside
    console.log(cartItem._id);
    if (cartItem.items.length == 0) {
      await Cart.deleteOne({ _id: cartItem._id });
    } else {
      await cartItem.save();
    }

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};

//get the items in a users cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.find({ userId: req.userId });

    res.status(200).json({ msg: "cart items", cart });
  } catch (err) {
    next(err);
  }
};
