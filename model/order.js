const { Schema, default: mongoose } = require("mongoose");
const { MenuItem, menuItemSchema } = require("./menu-item");

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  location: {
    type: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    required: true,
  },
  orderTime: {
    type: Number,
    required: true,
    default: Date.now(),
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
      item: {
        type: menuItemSchema,
        required: true,
      },
    },
  ],
});

exports.Order = mongoose.model("Order", orderSchema);
