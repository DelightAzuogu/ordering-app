const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
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
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
