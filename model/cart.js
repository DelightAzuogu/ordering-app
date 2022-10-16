const { Schema, default: mongoose } = require("mongoose");
const { menuItemSchema, MenuItem } = require("./menu-item");

const cartSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  items: [
    {
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      itemId: {
        type: String,
        required: true,
      },
    },
  ],
});

exports.Cart = mongoose.model("Cart", cartSchema);
