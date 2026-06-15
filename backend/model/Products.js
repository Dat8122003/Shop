const mongoose = require("mongoose");

const skuSchema = new mongoose.Schema(
  {
    combo: { type: Map, of: String },
    stock: { type: Number, default: 0, min: 0 },
    priceAdjust: { type: Number, default: 0 },
  },
  { _id: false }
);

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const productsSchema = new mongoose.Schema(
  {
    p_id: {
      type: String,
      default: function () {
        return this._id.toString();
      },
      index: true,
    },
    p_name: { type: String, index: true, required: true },
    p_description: { type: String, default: "" },
    p_price: { type: Number, required: true, min: 0 },
    p_discountPrice: { type: Number, default: 0, min: 0 },
    p_img: { type: String, default: "" },
    p_images: { type: [String], default: [] },
    p_attributes: { type: [attributeSchema], default: [] },
    p_skus: { type: [skuSchema], default: [] },
    p_stock: { type: Number, default: 0, min: 0 },
    p_sold: { type: Number, default: 0, index: true },
    p_category: { type: String, index: true, default: "b" },
    p_ratingAvg: { type: Number, default: 0 },
    p_ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productsSchema.statics.skuKey = function (attributes) {
  if (!attributes || typeof attributes !== "object") return "";
  return Object.keys(attributes)
    .sort()
    .map((k) => `${k}:${attributes[k]}`)
    .join("|");
};

productsSchema.methods.parseVariant = function (variant) {
  if (!variant) return {};
  return Object.fromEntries(
    variant.split("|").map((kv) => {
      const [k, ...rest] = kv.split(":");
      return [k.trim(), rest.join(":").trim()];
    })
  );
};

module.exports = mongoose.model("Products", productsSchema);
