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
  price: {
    type: Number,
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

// const cartSchema = new Schema({
//   itemId: {
//     type: String,
//     require: true,
//   },
//   price: {
//     type: Number,
//     require: true,
//   },
//   restaurantId: {
//     type: String,
//     require: true,
//   },
//   userId: {
//     type: String,
//     require: true,
//   },
//   quantity: {
//     type: Number,
//     require: true,
//     default: 1,
//   },
//   item: {
//     type: menuItemSchema,
//     require: true,
//   },
// });

exports.Cart = mongoose.model("Cart", cartSchema);
