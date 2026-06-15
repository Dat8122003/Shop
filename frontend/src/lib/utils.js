export const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of ["products", "orders", "users", "items", "data"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
};

export const priceOf = (p) => {
  if (!p) return 0;
  const d = Number(p.p_discountPrice);
  if (Number.isFinite(d) && d > 0) return d;
  return Number(p.p_price) || 0;
};

export const variantKey = (p_id, variant = "") =>
  `${p_id}__${variant || ""}`;

export const skuKey = (attributes) =>
  Object.keys(attributes || {})
    .sort()
    .map((k) => `${k}:${attributes[k]}`)
    .join("|");

export const parseVariantKey = (variant = "") => {
  if (!variant) return {};
  return Object.fromEntries(
    variant.split("|").map((kv) => {
      const [k, ...rest] = kv.split(":");
      return [k.trim(), rest.join(":").trim()];
    })
  );
};

export const formatVnd = (n) =>
  `${Number(n || 0).toLocaleString("vi-VN")}đ`;

export const cn = (...args) => args.filter(Boolean).join(" ");
