const { Schema, default: mongoose } = require("mongoose");
const { MenuItem, menuItemSchema } = require("./menu-item");

const orderSchema = new Schema({
  itemId: {
    type: String,
    require: true,
  },
  restaurantId: {
    type: String,
    require: true,
  },
  userId: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
    default: 1,
  },
  item: {
    type: menuItemSchema,
    require: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
