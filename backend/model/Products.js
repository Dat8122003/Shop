const mongoose = require("mongoose");
const productsSchema = new mongoose.Schema({
  p_id: {
    type: String,
    default: function () {
      return this._id.toString();
    },
  },
  p_name: { type: String },
  p_description: { type: String },
  p_price: { type: Number },
  p_discountPrice: { type: Number },
  p_img: { type: String },
  p_stock: { type: Number },
  p_category: { type: String },
});
module.exports = mongoose.model("Products", productsSchema);
