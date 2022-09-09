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

//ADD ITEM
exports.putAddItem = async (req, res, next) => {
  const err = validationError(req);
  if (err) next(err);

  const rest = await Restaurant.findOne({ id: req.userId });
  if (!rest) {
    const err = new Error("invalid restaurant");
    err.status = 400;
    next(err);
  }

  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  const restId = req.userId;

  const stream = Readable.from(req.file.buffer);

  const uploadImg = await googleDriveUpload(req, stream);
  if (uploadImg instanceof Error) {
    next(uploadImg);
  }

  const imageId = uploadImg.data.id;

  const imgLink = await googleDriveGetLink(uploadImg.data.id);

  if (imgLink instanceof Error) {
    const deleteImg = googleDriveDelete(imageId);
    if (deleteImg instanceof Error) {
      next(deleteImg);
    }
    next(imgLink);
  }
  const imageUrl = imgLink.data.webViewLink;

  try {
    const createMenuItem = {
      name,
      price,
      description,
      restaurantId: restId,
      imageUrl,
      imageId,
    };

    const menuItem = await MenuItem.create(createMenuItem);

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
  //validation error
  const err = validationError(req);
  if (err) next(err);

  try {
    //check rest
    const rest = await Restaurant.findOne({ id: req.userId });
    if (!rest) {
      const err = new Error("invalid restaurant");
      err.status = 400;
      throw err;
    }

    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const itemId = req.params.id;

    const menuItem = await MenuItem.findOne({ id: itemId });

    let imageId = menuItem.imageId;
    let imageUrl = menuItem.imageUrl;

    if (req.file) {
      const stream = Readable.from(req.file.buffer);

      const uploadImg = await googleDriveUpload(req, stream);
      if (uploadImg instanceof Error) {
        throw uploadImg;
      }

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

    menuItem.name = name;
    menuItem.description = description;
    menuItem.price = price;
    menuItem.imageUrl = imageUrl;
    menuItem.imageId = imageId;
    const updatedMenuItem = await menuItem.save();

    const newMenu = rest.menu.map((element) => {
      if (element.id === menuItem.id) {
        return updatedMenuItem;
      } else {
        return element;
      }
    });

    rest.menu = newMenu;

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
    const rest = await Restaurant.findOne({ id: req.userId });
    if (!rest) {
      const err = new Error("invalid restaurant");
      err.status = 400;
      throw err;
    }
    const id = req.params.id;

    const menuItem = await MenuItem.findOneAndDelete({ id });

    const deleteImg = googleDriveDelete(menuItem.imageId);
    if (deleteImg instanceof Error) {
      throw deleteImg;
    }

    rest.menu = rest.menu.filter((element) => {
      if (element.id != id) {
        return element;
      }
    });
    await rest.save();

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};
