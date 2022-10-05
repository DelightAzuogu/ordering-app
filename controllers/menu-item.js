const { Readable } = require("stream");
require("dotenv").config();
const validationError = require("../util/validationError");
const { MenuItem } = require("../model/menu-item");
const { Restaurant } = require("../model/restaurant");
const {
  googleDriveDelete,
  googleDriveGetLink,
  googleDriveUpload,
} = require("../util/google-drive");
const { Cart } = require("../model/cart");
const newError = require("../util/error");
const { ObjectId } = require("mongodb");

//ADD menu item
exports.putAddItem = async (req, res, next) => {
  try {
    const err = validationError(req);
    if (err) throw err;

    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const restId = req.restId;

    let imageId = "";
    let imageUrl = "";

    if (req.file) {
      //converting the img buffer to a readable stream
      const stream = Readable.from(req.file.buffer);
      //uploading the img to google drive
      const uploadImg = await googleDriveUpload(req, stream);
      if (uploadImg instanceof Error) {
        throw uploadImg;
      }

      imageId = uploadImg.data.id;

      // get the img link
      const imgLink = await googleDriveGetLink(uploadImg.data.id);

      if (imgLink instanceof Error) {
        //delete the img if eerror
        const deleteImg = googleDriveDelete(imageId);
        if (deleteImg instanceof Error) {
          throw deleteImg;
        }
        throw imgLink;
      }
      imageUrl = imgLink.data.webViewLink;
    }

    //create item
    const createMenuItem = {
      name,
      price,
      description,
      restaurantId: restId,
      imageUrl,
      imageId,
    };

    const menuItem = await MenuItem.create(createMenuItem);

    res.status(201).json({
      msg: "created",
      id: menuItem.id,
    });
  } catch (err) {
    next(err);
  }
};

//edit ITEM
exports.postEditMenuItem = async (req, res, next) => {
  try {
    //validation error
    const err = validationError(req);
    if (err) next(err);

    const itemId = req.params.id;

    let menuItem = await MenuItem.findOne({ _id: ObjectId(itemId) });

    let imageId = menuItem.imageId;
    let imageUrl = menuItem.imageUrl;

    if (req.file) {
      //check if the img was changed
      //upload the new img and delete the old img
      //change the img links
      const stream = Readable.from(req.file.buffer);

      const uploadImg = await googleDriveUpload(req, stream);
      if (uploadImg instanceof Error) {
        throw uploadImg;
      }

      //updating the img in drive
      const imgLink = await googleDriveGetLink(uploadImg.data.id);

      if (imgLink instanceof Error) {
        const deleteImg = googleDriveDelete(uploadImg.data.id);
        if (deleteImg instanceof Error) {
          throw deleteImg;
        }
        throw imgLink;
      }

      const deleteImg = googleDriveDelete(imageId);
      if (deleteImg instanceof Error) {
        throw deleteImg;
      }
      imageId = uploadImg.data.id;
      imageUrl = imgLink.data.webViewLink;
    }

    //update the menuitem
    menuItem.name = req.body.name;
    menuItem.description = req.body.description;
    menuItem.price = req.body.price;
    menuItem.imageUrl = imageUrl;
    menuItem.imageId = imageId;
    menuItem = await menuItem.save();

    //updateing the prices in the carts as well
    let cartItems = await await Cart.find({
      restaurantId: menuItem.restaurantId,
      "items.itemId": menuItem.id,
    });
    if (cartItems.length > 0) {
      for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].items = cartItems[i].items.map((value) => {
          if (value.itemId == itemId) {
            //remove the item price from cart -- change the item price -- add the item price back to cart
            cartItems[i].price -= value.price;
            value.price = value.quantity * menuItem.price;
            cartItems[i].price += value.price;
            return value;
          } else {
            return value;
          }
        });
        cartItems[i].save();
      }
    }

    res.status(201).json({
      msg: "updated",
    });
  } catch (err) {
    next(err);
  }
};

//DELETE ITEM
exports.deleteItem = async (req, res, next) => {
  try {
    const itemId = req.params.id;

    //find and delete the menuItem
    const menuItem = await MenuItem.findOneAndDelete({ _id: ObjectId(itemId) });
    if (!menuItem) {
      throw newError("item not found", 400);
    }

    //delete the img from drive
    const deleteImg = googleDriveDelete(menuItem.imageId);
    if (deleteImg instanceof Error) {
      throw deleteImg;
    }

    //deleting from carts as well
    const cartItems = await Cart.find({
      restaurantId: menuItem.restaurantId,
      "items.itemId": itemId,
    });
    for (let i = 0; i < cartItems.length; i++) {
      cartItems[i].items = cartItems[i].items.filter((value) => {
        if (value.itemId == menuItem.id) {
          //reducing the cart price
          cartItems[i].price -= value.price;
          return false;
        } else {
          return true;
        }
      });
      //deleteing the cart if there is no item inside
      if (cartItems[i].items.length == 0) {
        console.log("inside");
        console.log();
        await Cart.deleteOne({ _id: cartItems[i].id });
      } else {
        await cartItems[i].save();
      }
    }

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};
