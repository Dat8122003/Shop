const Products = require("../model/Products");
const Order = require("../model/Order");

const getHotProducts = async (limit = 8) => {
  const fromCounter = await Products.find({ p_sold: { $gt: 0 } })
    .sort({ p_sold: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  if (fromCounter.length >= limit) return fromCounter;

  const rankedFromOrders = await Order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        sold: { $sum: "$products.quantity" },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "p_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $replaceRoot: { newRoot: "$product" } },
  ]);

  const seen = new Set(fromCounter.map((p) => p.p_id));
  const merged = [...fromCounter];
  for (const p of rankedFromOrders) {
    if (!seen.has(p.p_id)) {
      merged.push(p);
      seen.add(p.p_id);
      if (merged.length >= limit) break;
    }
  }
  return merged.slice(0, limit);
};

const getRelatedProducts = async ({ p_id, p_category, limit = 8 }) => {
  if (!p_category) return [];
  return Products.find({
    p_category,
    p_id: { $ne: p_id },
  })
    .sort({ p_sold: -1, p_ratingAvg: -1, createdAt: -1 })
    .limit(limit)
    .lean();
};

const getRecommendations = async (p_id, limit = 8) => {
  const product = await Products.findOne({ p_id })
    .select("p_category p_id")
    .lean();
  if (!product) return [];
  return getRelatedProducts({
    p_id: product.p_id,
    p_category: product.p_category,
    limit,
  });
};

module.exports = { getHotProducts, getRelatedProducts, getRecommendations };
