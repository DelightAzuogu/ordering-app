const { Readable } = require("stream");
require("dotenv").config();
const { google } = require("googleapis");
const { uuid } = require("uuidv4");
const validationError = require("../util/validationError");
const { MenuItem } = require("../model/menu-item");
const { Restaurant } = require("../model/restaurant");

const googleDrive = () => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT__SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  return drive;
};

const googleDriveUpload = async (req, stream) => {
  const drive = googleDrive();
  try {
    const response = await drive.files.create({
      requestBody: {
        name: uuid() + "-" + req.file.originalname,
        mimeType: req.file.mimeType,
      },
      media: {
        mimeType: req.file.mimeType,
        body: stream,
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

const googleDriveDelete = async (fileId) => {
  const drive = googleDrive();
  try {
    const response = await drive.files.delete({
      fileId,
    });
    return response;
  } catch (err) {
    return err;
  }
};

const googleDriveGetLink = async (fileId) => {
  const drive = googleDrive();
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId,
      fields: "webContentLink, webViewLink",
    });

    return result;
  } catch (err) {
    return err;
  }
};

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
  const err = validationError(req);
  if (err) next(err);

  try {
    const rest = await Restaurant.findOne({ id: req.userId });
    if (!rest) {
      const err = new Error("invalid restaurant");
      err.status = 400;
      throw err;
    }
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const restId = req.userId;
    const itemId = req.param.id;

    const menuItem = await menuItem.findOne({ id: itemId });

    let imageId = menuItem.imageId;
    let imageUrl = menuItem.imageUrl;

    if (req.file) {
      const stream = Readable.from(req.file.buffer);
      /////////
      const uploadImg = await googleDriveUpload(req, stream);
      if (uploadImg instanceof Error) {
        next(uploadImg);
      }
      imageId = uploadImg.data.id;

      const imgLink = await googleDriveGetLink(uploadImg.data.id);

      if (imgLink instanceof Error) {
        const deleteImg = googleDriveDelete(imageId);
        if (deleteImg instanceof Error) {
          next(deleteImg);
        }
        next(imgLink);
      }
      imageUrl = imgLink.data.webViewLink;
    }

    menuItem.name = name;
    menuItem.description = description;
    menuItem.price = price;
    menuItem.imageUrl = imageUrl;
    menuItem.imageId = imageId;
    const updatedMenuItem = menuItem.save();

    const newMenu = rest.menu.map((element) => {
      if (element.id === menuItem.id) {
        return updatedMenuItem;
      }
      return element;
    });
    rest.menu = newMenu;
    const updatedRest = rest.save();
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
exports.deleteDeleteItem = async (req, res, next) => {
  try {
    const rest = await Restaurant.findOne({ id: req.userId });
    if (!rest) {
      const err = new Error("invalid restaurant");
      err.status = 400;
      throw err;
    }
    const id = req.params.id;

    const menuItem = await MenuItem.findOne({ id });
    MenuItem.remove({ id });

    const deleteImg = googleDriveDelete(menuItem.imageId);
    if (deleteImg instanceof Error) {
      throw deleteImg;
    }

    rest.menu = rest.menu.filter((element) => {
      if (element.id != id) {
        return element;
      }
    });

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};
