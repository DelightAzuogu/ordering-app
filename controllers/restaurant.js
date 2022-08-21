const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { Restaurant } = require("../model/restaurant");
const ValErrorCheck = require("../util/validationError");

const _signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET
  );
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
