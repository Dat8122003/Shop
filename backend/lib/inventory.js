const mongoose = require("mongoose");
const Products = require("../model/Products");
const Order = require("../model/Order");
const User = require("../model/User");
const { validPhone } = require("./validate");

const parseVariant = (variant = "") => {
  if (!variant) return {};
  return Object.fromEntries(
    variant.split("|").map((kv) => {
      const [k, ...rest] = kv.split(":");
      return [k.trim(), rest.join(":").trim()];
    })
  );
};

const decrementOne = async (session, { p_id, variant = "", quantity }) => {
  const qty = Math.max(1, Number(quantity) || 1);

  if (variant) {
    const target = parseVariant(variant);
    const targetKey = Products.skuKey(target);
    const product = await Products.findOne({ p_id }).session(session);
    if (!product) return { ok: false, p_id, reason: "NOT_FOUND" };
    const idx = product.p_skus.findIndex(
      (s) => Products.skuKey(Object.fromEntries(s.combo || [])) === targetKey
    );
    if (idx < 0) return { ok: false, p_id, reason: "SKU_NOT_FOUND" };
    if (product.p_skus[idx].stock < qty) return { ok: false, p_id, reason: "OUT_OF_STOCK" };

    const updated = await Products.findOneAndUpdate(
      {
        p_id,
        p_skus: { $elemMatch: { stock: { $gte: qty } } },
      },
      {
        $inc: {
          [`p_skus.${idx}.stock`]: -qty,
          p_stock: -qty,
          p_sold: qty,
        },
      },
      { session, new: true }
    );
    if (!updated) return { ok: false, p_id, reason: "OUT_OF_STOCK" };
    return { ok: true, product: updated, variant, quantity: qty, priceAdjust: product.p_skus[idx].priceAdjust || 0 };
  }

  const updated = await Products.findOneAndUpdate(
    { p_id, p_stock: { $gte: qty } },
    { $inc: { p_stock: -qty, p_sold: qty } },
    { session, new: true }
  );
  if (!updated) return { ok: false, p_id, reason: "OUT_OF_STOCK" };
  return { ok: true, product: updated, variant: "", quantity: qty, priceAdjust: 0 };
};

const createOrderAtomic = async (req) => {
  const {
    products = [],
    totalPrice,
    customerName,
    phoneNumber,
    shippingAddress,
    mode,
  } = req.body || {};

  if (!Array.isArray(products) || !products.length) {
    throw Object.assign(new Error("Cart is empty"), { status: 400 });
  }
  if (!customerName || !phoneNumber || !shippingAddress) {
    throw Object.assign(new Error("Missing shipping info"), { status: 400 });
  }
  if (!validPhone(phoneNumber)) {
    throw Object.assign(new Error("Invalid phone number"), { status: 400 });
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const decremented = [];
      for (const it of products) {
        const r = await decrementOne(session, {
          p_id: it.p_id,
          variant: it.variant || "",
          quantity: it.quantity,
        });
        if (!r.ok) {
          const p = await Products.findOne({ p_id: it.p_id })
            .session(session)
            .select("p_name p_stock");
          throw Object.assign(
            new Error(`"${p?.p_name || it.p_id}" is out of stock`),
            { status: 409, payload: { p_id: it.p_id, name: p?.p_name, stock: p?.p_stock || 0 } }
          );
        }
        decremented.push(r);
      }

      const orderProducts = decremented.map((r) => {
        const base = Number(r.product.p_discountPrice || r.product.p_price) || 0;
        return {
          productId: r.product.p_id,
          productName: r.product.p_name,
          variant: r.variant,
          price: base + Number(r.priceAdjust || 0),
          quantity: r.quantity,
        };
      });

      const [order] = await Order.create(
        [
          {
            userId: req.user?._id || null,
            products: orderProducts,
            totalPrice,
            customerName,
            phoneNumber,
            shippingAddress,
            status: "Pending",
          },
        ],
        { session }
      );

      if (mode === "cart" && req.user) {
        await User.updateOne(
          { _id: req.user._id },
          {
            $pull: {
              cart: {
                $or: orderProducts.map((p) => ({ p_id: p.productId, variant: p.variant })),
              },
            },
          },
          { session }
        );
      }
      result = order;
    });
    return result;
  } finally {
    session.endSession();
  }
};

module.exports = { createOrderAtomic, decrementOne, parseVariant };
