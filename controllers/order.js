const { ObjectId } = require("mongodb");
const { Cart } = require("../model/cart");
const { MenuItem } = require("../model/menu-item");
const { Order } = require("../model/order");
const { Restaurant } = require("../model/restaurant");
const User = require("../model/user");
const newError = require("../util/error");
const { menuItemCheck } = require("../util/menu-item-check");
const validationError = require("../util/validationError");

//this checks id
const checkOrder = async (id) => {
  const order = await Order.findOne({ _id: ObjectId(id) });
  if (!order) {
    throw newError("order not found", 400);
  } else {
    return order;
  }
};

//order from only i=one rest
exports.postRestOrder = async (req, res, next) => {
  try {
    const restId = req.params.restId;
    const userId = req.userId;

    //chceck the restaurant
    const rest = await Restaurant.findOne({ _id: ObjectId(restId) });
    if (!rest) {
      throw newError("restaurant not found", 400);
    }

    //get the cart
    const cart = await Cart.findOne({
      userId,
      restaurantId: restId,
    });
    if (!cart) {
      throw newError("cart not found", 400);
    }

    //creating the cart
    let createOrder = {
      userId,
      restaurantId: restId,
      items: [],
      location: {
        address: req.body.address,
        city: req.body.city,
      },
    };

    //add the items to the order
    for (let value of cart.items) {
      const item = await MenuItem.findOne({ _id: ObjectId(value.itemId) });
      //dont order items that have benn deleted
      if (item) {
        await createOrder.items.push({
          price: value.price,
          quantity: value.quantity,
          item,
        });
      }
    }

    //delet the cart
    await Cart.deleteOne({ _id: cart._id });

    //deleting the cart if the items inside where already deleted
    if (createOrder.items.length == 0) {
      throw newError("items not found", 400);
    }

    //create the order
    await Order.create(createOrder);

    //increase the rest order count
    rest.orderCount++;
    rest.save();

    res.status(200).json({ msg: "order successful" });
  } catch (err) {
    next(err);
  }
};

//order everything in the cart
exports.postOrderAll = async (req, res, next) => {
  try {
    const valErr = validationError(req);
    if (valErr) {
      throw valErr;
    }

    const userId = req.userId;

    //find all the cart items
    const cartItems = await Cart.find({
      userId,
    });

    if (cartItems.length == 0) {
      throw newError("items not found", 400);
    }

    let createOrder;

    for (let cart of cartItems) {
      //creating the order template
      createOrder = {
        userId,
        restaurantId: cart.restaurantId,
        items: [],
        location: {
          address: req.body.address,
          city: req.body.city,
        },
      };
      //fillig up the order items
      for (let value of cart.items) {
        //validating the menuItems
        const item = await MenuItem.findOne({
          _id: ObjectId(value.itemId),
        });
        if (item) {
          createOrder.items.push({
            price: value.price,
            quantity: value.quantity,
            item,
          });
        }
      }

      await Cart.deleteOne({ _id: cart._id });

      if (createOrder.items.length > 0) {
        await Order.create(createOrder);
        await Restaurant.updateOne(
          { _id: ObjectId(cart.restaurantId) },
          {
            $inc: {
              orderCount: 1,
            },
          }
        );
      }
    }

    res.status(200).json({
      msg: "created",
    });
  } catch (err) {
    next(err);
  }
};

//delete item from order(for both user and restaurant)
exports.deleteOrderItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    //check Item
    const item = await menuItemCheck(itemId);

    //get the order
    const order = await checkOrder(req.params.orderId);

    //checking if the its a user or a restaurant
    if (req.userId) {
      //check for cancellation time
      if (order.orderTime - Date.now() > 300000) {
        throw newError("cancellation time expired", 400);
      }
    }

    //update the order items
    order.items = order.items.filter((value) => {
      if (value.item.id == item.id) {
        return false;
      } else return true;
    });

    if (order.items.length == 0) {
      await order.deleteOne({ _id: order._id });
      await Restaurant.updateOne(
        { _id: ObjectId(order.restaurantId) },
        {
          $inc: {
            orderCount: -1,
          },
        }
      );
    } else {
      order.save();
    }

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};

//delete the full order
exports.deleteOrder = async (req, res, next) => {
  try {
    //check the error
    const order = await checkOrder(req.params.orderId);
    if (req.userId) {
      if (order.orderTime - Date.now() > 300000) {
        throw newError("cancellation time expired", 400);
      }
    }

    order.deleteOne();

    res.status(200).json({ msg: "delete" });
  } catch (err) {
    next(err);
  }
};
