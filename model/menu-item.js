const { Schema, default: mongoose } = require("mongoose");

const menuItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: String,
  imageId: String,

  price: {
    type: Number,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
});

exports.menuItemSchema = menuItemSchema;
exports.MenuItem = mongoose.model("MenuItem", menuItemSchema);
