const express = require("express");
const { body } = require("express-validator");
const Multer = require("multer");

const isAuth = require("../util/is-auth");
const menuController = require("../controllers/menu-item");

const router = express.Router();

const { v4: uuidv4 } = require("uuid");
const { memoryStorage } = require("multer");

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
  "/add-menu-item",
  upload.single("image"),
  menuController.putAddMenuItem
);

module.exports = router;
