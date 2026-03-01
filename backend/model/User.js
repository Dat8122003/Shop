const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  passWord: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  img: {
    type: String,
  },
  role: { type: String, default: "user" },
  cart: [
    {
      p_id: { type: String },
      quantity: { type: Number, default: 1 },
    },
  ],
});
module.exports = mongoose.model("User", userSchema);
