const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require("../model/user");
const { Restaurant } = require("../model/restaurant");

//checking validation error
const ValErrorCheck = (req) => {
  const valErr = validationResult(req);
  if (!valErr.isEmpty()) {
    const err = new Error("validation error");
    err.status = 401;
    err.data = valErr.array();
    return err;
  }
  return null;
};

const _signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    "topGun"
  );
};

//login user
exports.postLoginUser = async (req, res, next) => {
  try {
    const valErr = ValErrorCheck(req);
    if (valErr) throw valErr;

    const email = req.body.email;
    const pw = req.body.password;
    const user = await User.findOne({ email });

    //check password
    const pwEqual = bcrypt.compareSync(pw, user.password);

    if (!pwEqual) {
      const error = new Error("invalid password");
      error.status = 401;
      throw error;
    }

    const token = _signToken(user);

    res.status(200).json({ msg: "logged in", token, userId: user.id });
  } catch (err) {
    next(err);
  }
};

//login restaurants
exports.postLoginRest = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) throw valErr;

  const email = req.body.email;
  const pw = req.body.password;
  try {
    const rest = await Restaurant.findOne({ email });

    const pwEqual = bcrypt.compareSync(pw, rest.password);
    if (!pwEqual) {
      let err = new Error("invalid Password");
      err.status = 401;
      throw err;
    }

    const token = _signToken(rest);

    const hasItem = rest.menu.length > 0;

    res.status(200).json({ msg: "logged in", hasItem, token });
  } catch (err) {
    next(err);
  }
};

//signup user
exports.putSignupUser = async (req, res, next) => {
  try {
    const valErr = ValErrorCheck(req);
    console.log(valErr);
    if (valErr) {
      throw valErr;
    }

    const email = req.body.email;
    const pw = req.body.password;
    const confirmPw = req.body.confirmPassword;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    if (confirmPw !== pw) {
      const err = new Error("passwords do not match");
      err.status = 401;
      throw err;
    }

    const hashPassword = await bcrypt.hash(pw, 12);
    const createUser = {
      firstname,
      lastname,
      password: hashPassword,
      email,
    };

    const user = await User.create(createUser);

    const token = _signToken(user);

    res.status(201).json({
      msg: "account created",
      userId: user.id,
      token,
    });
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
    let err = new Error();
    err.status = 401;
    throw err;
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

    const rest = Restaurant.create(createRest);

    const token = _signToken(rest);

    res.status(201).json({ msg: "created", token });
  } catch (err) {
    next(err);
  }
};
