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
    const phone = req.body.phone;
    const address = req.body.address;
    const city = req.body.city;

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
      phone,
      location: [
        {
          address,
          city,
        },
      ],
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

//EDIT
exports.putEditUserDetails = async (req, res, next) => {
  try {
    const valErr = validationError(req);
    if (valErr) throw valErr;

    //editing the user
    User.findOneAndUpdate(
      { _id: req.user_Id },
      {
        firstname: req.body.firstname,
        phone: req.body.phone,
        lastname: req.body.lastname,
      }
    );

    res.status(201).json({ msg: "updated" });
  } catch (err) {
    next(err);
  }
};

//confirming password
exports.postConfirmPassword = async (req, res, next) => {
  try {
    const password = req.body.password;

    const user = await User.findOne({ _id: req.user_Id });

    //check the password
    const pwEqual = bcrypt.compareSync(password, user.password);
    if (!pwEqual) {
      res.status(400).json({ msg: pwEqual });
    } else {
      res.status(200).json({ msg: pwEqual });
    }
  } catch (err) {
    next(err);
  }
};
