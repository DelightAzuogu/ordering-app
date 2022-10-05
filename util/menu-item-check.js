const newError = require("./error");
const { MenuItem } = require("../model/menu-item");
const { ObjectId } = require("mongodb");

exports.menuItemCheck = async (itemId) => {
  const item = await MenuItem.findOne({ _id: ObjectId(itemId) });
  if (!item) {
    throw newError("item not found", 400);
  } else return item;
};
