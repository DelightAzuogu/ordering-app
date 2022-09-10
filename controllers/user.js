const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../model/user");
const validationError = require("../util/validationError");
const newError = require("../util/error");

//sign the token
const _signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

//login user
exports.postLoginUser = async (req, res, next) => {
  try {
    const valErr = validationError(req);
    if (valErr) throw valErr;

    const email = req.body.email;
    const pw = req.body.password;
    const user = await User.findOne({ email });

    //check password
    const pwEqual = bcrypt.compareSync(pw, user.password);

    if (!pwEqual) {
      throw newError("invalid Password", 400);
    }

    const token = _signToken(user);

    res.status(200).json({ msg: "logged in", token });
  } catch (err) {
    next(err);
  }
};

//signup user
exports.putSignupUser = async (req, res, next) => {
  try {
    const valErr = validationError(req);
    if (valErr) {
      throw valErr;
    }

    const email = req.body.email;
    const pw = req.body.password;
    const confirmPw = req.body.confirmPassword;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    //confirm passwords
    if (confirmPw !== pw) {
      throw newError("passwords do not match", 401);
    }

    //hash password
    const hashPassword = await bcrypt.hash(pw, 12);

    //create user
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
      token,
    });
  } catch (err) {
    next(err);
  }
};

//EDIT
exports.putEditUser = async (req, res, next) => {
  const valErr = validationError(req);
  if (valErr) next(valErr);

  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const phone = req.body.phone;
  const password = req.body.password;
  const id = req.userId;

  try {
    const user = await User.findOne({ id });

    //comparing passwords
    const pwEqual = bcrypt.compareSync(password, user.password);
    if (!pwEqual) {
      throw newError("invalid Password", 401);
    }

    //updating the user
    await User.findOneAndUpdate({ id }, { firstname, lastname, phone });

    res.status(200).json({ msg: "updated" });
  } catch (err) {
    next(err);
  }
};
