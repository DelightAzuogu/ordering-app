const { Schema, default: mongoose } = require("mongoose");
const { MenuItem } = require("./menu-item");

const cartSchema = new Schema({
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
});

module.exports = mongoose.model("Cart", cartSchema);
