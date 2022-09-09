const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { Restaurant } = require("../model/restaurant");
const ValErrorCheck = require("../util/validationError");
const newError = require("../util/error");
const { MenuItem } = require("../model/menu-item");
const { googleDriveDelete } = require("../util/google-drive");

const _signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "20h",
    }
  );
};

//login restaurants
exports.postLoginRest = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) {
    next(valErr);
  }

  const email = req.body.email;
  const pw = req.body.password;
  try {
    const rest = await Restaurant.findOne({ email });

    const pwEqual = bcrypt.compareSync(pw, rest.password);
    if (!pwEqual) {
      throw newError("invalid password", 401);
    }

    const token = _signToken(rest);

    rest.status = true;
    await rest.save();

    const hasItem = rest.menu.length > 0;

    res.status(200).json({ msg: "logged in", hasItem, token });
  } catch (err) {
    next(err);
  }
};

//restauratn sign up page
exports.putSignupRest = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) next(valErr);

  const email = req.body.email;
  const name = req.body.name;
  const pw = req.body.password;
  const confirmPw = req.body.confirmPassword;
  const address = req.body.address || "";
  const phone = req.body.phone;

  if (confirmPw !== pw) {
    throw newError("passwords not match", 400);
  }

  try {
    const hashpw = await bcrypt.hash(pw, 12);

    const createRest = {
      name,
      email,
      password: hashpw,
      address,
      phone,
    };

    const rest = await Restaurant.create(createRest);

    const token = _signToken(rest);

    res.status(201).json({ msg: "created", token });
  } catch (err) {
    next(err);
  }
};

exports.putEditRestaurant = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) next(valErr);

  const restId = req.userId;
  try {
    const rest = await Restaurant.findOne({ id: restId });
    if (!rest) {
      throw newError("restaurant not found", 400);
    }
    rest.name = req.body.name;
    rest.address = req.body.address;
    rest.phone = req.body.phone;

    const updatedRest = await rest.save();
    res.status(200).json({ msg: "edited" });
  } catch (err) {
    next(err);
  }
};

exports.getCheckPassword = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) next(valErr);

  try {
    const rest = await Restaurant.findOne({ id: req.userId });
    if (!rest) {
      throw newError("restaurant not found", 400);
    }

    const passwordMatch = bcrypt.compareSync(req.body.password, rest.password);
    if (passwordMatch) {
      res.status(200).json({ msg: "matched" });
    } else {
      res.status(400).json({ msg: "unmatched" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getRestaurant = async (req, res, next) => {
  const restId = req.params.id;
  try {
    const rest = await Restaurant.findOne({ id: restId });
    if (!rest) {
      throw newError("restaurant not found", 400);
    }

    res.status(200).json({ restaurant: rest });
  } catch (err) {
    next(err);
  }
};

const deleteMenuItem = async (id) => {
  try {
    const menuItem = await MenuItem.findOneAndDelete({ id });
    const deleteImg = googleDriveDelete(menuItem.imageId);
    if (deleteImg instanceof Error) {
      throw deleteImg;
    }
    return true;
  } catch (err) {
    return err;
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  const restId = req.userId;

  try {
    const rest = await Restaurant.findOneAndDelete({ id: restId });
    if (!rest) {
      throw newError("restaurant not found", 400);
    }

    for (let i = 0; i < rest.menu.length; i++) {
      const deleteItem = await deleteMenuItem(rest.menu[i].id);
      if (deleteItem instanceof Error) {
        throw deleteItem;
      }
    }

    res.status(200).json({ msg: "deleted" });
  } catch (err) {
    next(err);
  }
};
