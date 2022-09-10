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
const Cart = require("../model/cart");
const newError = require("../util/error");

//ADD menu item
exports.putAddItem = async (req, res, next) => {
  try {
    const err = validationError(req);
    if (err) next(err);

    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const restId = req.restId;

    //converting the img buffer to a readable stream
    const stream = Readable.from(req.file.buffer);

    //uploading the img to google drive
    const uploadImg = await googleDriveUpload(req, stream);
    if (uploadImg instanceof Error) {
      throw uploadImg;
    }

    const imageId = uploadImg.data.id;

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
    const imageUrl = imgLink.data.webViewLink;

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

    //add it to the menu of the restaurant
    const rest = await Restaurant.findOne({ id: req.restId });
    rest.menu.push(menuItem);
    const updatedrest = rest.save();

    res.status(201).json({
      msg: "created",
      menuItemId: menuItem.id,
      restId: updatedrest.id,
    });
  } catch (err) {
    next(err);
  }
};

//UPDATE ITEM
exports.postEditMenuItem = async (req, res, next) => {
  try {
    //validation error
    const err = validationError(req);
    if (err) next(err);

    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const itemId = req.params.id;

    const menuItem = await MenuItem.findOne({ id: itemId });

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
    menuItem.name = name;
    menuItem.description = description;
    menuItem.price = price;
    menuItem.imageUrl = imageUrl;
    menuItem.imageId = imageId;
    const updatedMenuItem = await menuItem.save();

    //updating the cart items
    await Cart.updateMany(
      { itemId: menuItem.id },
      {
        item: menuItem,
      }
    );

    //updating the restaurant item
    const rest = await Restaurant.findOne({ id: req.restId });
    rest.menu = rest.menu.map((element) => {
      if (element.id === menuItem.id) {
        return updatedMenuItem;
      } else {
        return element;
      }
    });
    const updatedRest = await rest.save();

    res.status(201).json({
      msg: "updated",
      restId: updatedRest.id,
      menuItemId: updatedMenuItem.id,
    });
  } catch (err) {
    next(err);
  }
};

//DELETE ITEM
exports.deleteItem = async (req, res, next) => {
  try {
    const id = req.params.id;

    //find and delete the menuItem
    const menuItem = await MenuItem.findOneAndDelete({ id });

    //delete the img from drive
    const deleteImg = googleDriveDelete(menuItem.imageId);
    if (deleteImg instanceof Error) {
      throw deleteImg;
    }

    //deleting the item in the restaurant menu
    const rest = await Restaurant.findOne({ id: req.restId });
    rest.menu = rest.menu.filter((element) => {
      if (element.id != id) {
        return element;
      }
    });
    rest.save();

    //deleting from carts as well
    await Cart.deleteMany({ itemId: menuItem.id });

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};
