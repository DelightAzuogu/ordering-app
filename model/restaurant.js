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
  location: {
    required: false,
    type: [
      {
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
      },
    ],
  },
  phone: {
    type: Number,
    required: true,
  },
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
