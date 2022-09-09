const express = require("express");
const { body } = require("express-validator");
const Multer = require("multer");

const isAuth = require("../util/is-auth");
const menuController = require("../controllers/menu-item");

const router = express.Router();

const { v4: uuidv4 } = require("uuid");
const { memoryStorage } = require("multer");
const { Restaurant } = require("../model/restaurant");

//multer option
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = new Multer({ storage: memoryStorage(), fileFilter });

router.put(
  "/add-item",
  upload.single("image"),
  [
    body("name").isAlpha().trim(),
    body("description").isAlpha().trim(),
    body("price").isNumeric().trim(),
  ],
  isAuth,
  menuController.putAddItem
);

router.post(
  "/edit-item/:id",
  upload.single("image"),
  [
    body("name").isAlpha().trim(),
    body("description").isAlpha().trim(),
    body("price").isNumeric().trim(),
  ],
  isAuth,
  menuController.postEditMenuItem
);

router.delete("/delete-item/:id", isAuth, menuController.deleteItem);

module.exports = router;