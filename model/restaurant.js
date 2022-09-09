const { Schema, default: mongoose } = require("mongoose");
const { menuItemSchema } = require("./menu-item");

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: String,
  phone: {
    type: Number,
    required: true,
  },
  menu: [menuItemSchema],
  orderCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
});

exports.Restaurant = mongoose.model("Restaurant", restaurantSchema);
