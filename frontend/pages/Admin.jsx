import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api, { formatVnd, cn } from "../src/lib/api";
import { skuKey } from "../src/lib/utils";

const CATEGORIES = [
  { value: "b", label: "Ô tô" },
  { value: "c", label: "Xe máy" },
  { value: "d", label: "Mô hình" },
  { value: "e", label: "Anime" },
];

const STATUSES = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy"];

const EMPTY_FORM = {
  p_name: "",
  p_description: "",
  p_price: 0,
  p_discountPrice: 0,
  p_img: "",
  p_images: [],
  p_category: "b",
  p_attributes: [],
  p_skus: [],
  p_stock: 0,
};

const TABS = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "products", label: "Sản phẩm" },
  { id: "orders", label: "Đơn hàng" },
  { id: "users", label: "Người dùng" },
];

function ImageUploader({ value = [], onChange, main, onMainChange }) {
  const inputRef = useRef(null);
  const addImages = (urls) =>
    onChange([...value, ...urls.filter((u) => !value.includes(u))]);
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => addImages([reader.result]);
      reader.readAsDataURL(f);
    });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {value.map((url, idx) => (
          <div
            key={url + idx}
            className={cn(
              "relative aspect-square border bg-neutral-50 group",
              main === idx && "ring-2 ring-black"
            )}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onMainChange(idx)}
                className="px-2 py-1 text-[10px] bg-white text-black font-bold uppercase"
              >
                Main
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                className="px-2 py-1 text-[10px] bg-black text-white font-bold uppercase"
              >
                Remove
              </button>
            </div>
            {main === idx && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] bg-black text-white font-bold uppercase">
                Main
              </span>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square border-2 border-dashed border-neutral-300 hover:border-black flex flex-col items-center justify-center text-neutral-500 hover:text-black transition"
        >
          <span className="text-2xl">+</span>
          <span className="text-[10px] uppercase tracking-wide font-semibold">
            Add
          </span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <input
        type="text"
        placeholder="Paste image URL and press Enter"
        className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value) {
            e.preventDefault();
            addImages([e.currentTarget.value]);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}

function AttributeEditor({
  attributes,
  skus,
  onAttributesChange,
  onSkusChange,
  baseStock,
  onBaseStockChange,
}) {
  const addAttribute = () =>
    onAttributesChange([...attributes, { name: "", options: [] }]);
  const updateAttribute = (idx, patch) =>
    onAttributesChange(
      attributes.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    );
  const removeAttribute = (idx) =>
    onAttributesChange(attributes.filter((_, i) => i !== idx));

  const addOption = (idx, option) => {
    if (!option.trim()) return;
    updateAttribute(idx, {
      options: [...attributes[idx].options, option.trim()],
    });
  };
  const removeOption = (attrIdx, optIdx) =>
    updateAttribute(attrIdx, {
      options: attributes[attrIdx].options.filter((_, i) => i !== optIdx),
    });

  const matrix = useMemo(() => {
    if (
      !attributes.length ||
      attributes.some((a) => !a.name || !a.options.length)
    )
      return [];
    const build = (idx, current) => {
      if (idx === attributes.length) return [current];
      const out = [];
      for (const opt of attributes[idx].options) {
        out.push(...build(idx + 1, { ...current, [attributes[idx].name]: opt }));
      }
      return out;
    };
    return build(0, {});
  }, [attributes]);

  useEffect(() => {
    if (!matrix.length) {
      onSkusChange([]);
      return;
    }
    const map = new Map(skus.map((s) => [skuKey(s.combo), s]));
    const next = matrix.map((combo) => {
      const k = skuKey(combo);
      const existing = map.get(k);
      return existing
        ? { ...existing, combo }
        : { combo, stock: 0, priceAdjust: 0 };
    });
    onSkusChange(next);
    const sum = next.reduce((s, x) => s + Number(x.stock || 0), 0);
    if (sum !== baseStock) onBaseStockChange(sum);
  }, [matrix.length]);

  return (
    <div className="space-y-4 border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Attributes & Variants
        </h3>
        <button
          type="button"
          onClick={addAttribute}
          className="text-xs px-3 py-1 bg-black text-white font-semibold uppercase tracking-wide"
        >
          + Attribute
        </button>
      </div>
      {attributes.length === 0 && (
        <p className="text-xs text-neutral-500">
          No attributes. Product uses a single stock value.
        </p>
      )}
      <div className="space-y-3">
        {attributes.map((attr, idx) => (
          <div key={idx} className="border border-neutral-200 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Color, Size)"
                value={attr.name}
                onChange={(e) => updateAttribute(idx, { name: e.target.value })}
                className="flex-1 border border-neutral-300 focus:border-black focus:outline-none px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeAttribute(idx)}
                className="text-xs px-3 py-1 border border-black text-black hover:bg-black hover:text-white font-semibold uppercase"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {attr.options.map((opt, oi) => (
                <span
                  key={oi}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-xs"
                >
                  {opt}
                  <button
                    type="button"
                    onClick={() => removeOption(idx, oi)}
                    className="text-neutral-500 hover:text-black"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add option"
                className="px-2 py-0.5 text-xs border border-neutral-300 focus:border-black focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption(idx, e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {matrix.length > 0 && (
        <div className="border border-neutral-200">
          <div className="px-3 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider">
            Variant Matrix
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-neutral-50">
                <tr>
                  {attributes.map((a) => (
                    <th
                      key={a.name}
                      className="text-left px-3 py-2 font-semibold uppercase tracking-wide"
                    >
                      {a.name}
                    </th>
                  ))}
                  <th className="text-left px-3 py-2 font-semibold uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="text-left px-3 py-2 font-semibold uppercase tracking-wide">
                    Price ±
                  </th>
                </tr>
              </thead>
              <tbody>
                {skus.map((s, i) => (
                  <tr key={i} className="border-t border-neutral-200">
                    {attributes.map((a) => (
                      <td key={a.name} className="px-3 py-2 font-medium">
                        {s.combo[a.name]}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) =>
                          onSkusChange(
                            skus.map((x, j) =>
                              j === i
                                ? { ...x, stock: Number(e.target.value) || 0 }
                                : x
                            )
                          )
                        }
                        className="w-20 border border-neutral-300 focus:border-black focus:outline-none px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={s.priceAdjust}
                        onChange={(e) =>
                          onSkusChange(
                            skus.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    priceAdjust: Number(e.target.value) || 0,
                                  }
                                : x
                            )
                          )
                        }
                        className="w-24 border border-neutral-300 focus:border-black focus:outline-none px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black bg-neutral-50">
                  <td
                    colSpan={attributes.length}
                    className="px-3 py-2 font-bold uppercase text-xs"
                  >
                    Total Stock (auto)
                  </td>
                  <td colSpan={2} className="px-3 py-2 font-bold">
                    {skus.reduce((sum, s) => sum + Number(s.stock || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [mainIdx, setMainIdx] = useState(0);

  const allImages = useMemo(() => {
    const set = new Set();
    const out = [];
    if (form.p_img) {
      set.add(form.p_img);
      out.push(form.p_img);
    }
    (form.p_images || []).forEach((u) => {
      if (!set.has(u)) {
        set.add(u);
        out.push(u);
      }
    });
    return out;
  }, [form.p_img, form.p_images]);

  useEffect(() => {
    if (!allImages[mainIdx] && allImages[0]) setMainIdx(0);
  }, [allImages.length]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImages = (list) => {
    const main = list[mainIdx] || list[0] || "";
    setForm((f) => ({ ...f, p_img: main, p_images: list }));
  };
  const handleMainChange = (idx) => {
    setMainIdx(idx);
    setField("p_img", allImages[idx]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.p_name.trim()) return;
    onSubmit({
      ...form,
      p_price: Number(form.p_price) || 0,
      p_discountPrice: Number(form.p_discountPrice) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={form.p_name}
              onChange={(e) => setField("p_name", e.target.value)}
              className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Price
              </label>
              <input
                type="number"
                min="0"
                value={form.p_price}
                onChange={(e) => setField("p_price", e.target.value)}
                className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Sale Price
              </label>
              <input
                type="number"
                min="0"
                value={form.p_discountPrice}
                onChange={(e) => setField("p_discountPrice", e.target.value)}
                className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={form.p_stock}
                onChange={(e) => setField("p_stock", e.target.value)}
                className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={form.p_category}
              onChange={(e) => setField("p_category", e.target.value)}
              className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={form.p_description}
              onChange={(e) => setField("p_description", e.target.value)}
              className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Images
          </label>
          <ImageUploader
            value={allImages}
            onChange={handleImages}
            main={mainIdx}
            onMainChange={handleMainChange}
          />
        </div>
      </div>

      <AttributeEditor
        attributes={form.p_attributes}
        skus={form.p_skus}
        onAttributesChange={(v) => setField("p_attributes", v)}
        onSkusChange={(v) => setField("p_skus", v)}
        baseStock={form.p_stock}
        onBaseStockChange={(v) => setField("p_stock", v)}
      />

      <div className="flex gap-2 pt-3 border-t border-neutral-200">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-black text-white font-semibold uppercase tracking-wide text-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : initial?._id || initial?.p_id
            ? "Update Product"
            : "Create Product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-black text-black font-semibold uppercase tracking-wide text-sm hover:bg-black hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);
  if (!stats)
    return (
      <div className="py-10 text-center text-neutral-500">Loading...</div>
    );
  const cards = [
    { label: "Revenue", value: formatVnd(stats.revenue) },
    { label: "Đơn hàng", value: stats.orderCount },
    { label: "Sản phẩm", value: stats.productCount },
    { label: "Người dùng", value: stats.userCount },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-black p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {c.label}
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight">
              {c.value}
            </div>
          </div>
        ))}
      </div>
      <div className="border border-black">
        <div className="px-4 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider">
          Low Stock Alert (≤5)
        </div>
        {stats.lowStock.length === 0 ? (
          <div className="px-4 py-6 text-center text-neutral-500 text-sm">
            All products are well stocked.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
                  Sold
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.lowStock.map((p) => (
                <tr key={p.p_id} className="border-t border-neutral-200">
                  <td className="px-4 py-2 font-medium">{p.p_name}</td>
                  <td className="px-4 py-2 uppercase text-xs">
                    {p.p_category}
                  </td>
                  <td className="px-4 py-2 text-right font-bold">
                    {p.p_stock}
                  </td>
                  <td className="px-4 py-2 text-right">{p.p_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProductsTab({
  products,
  onEdit,
  onDelete,
  onAdd,
  loading,
  stockMap,
  lastSync,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span
            className={cn(
              "inline-block w-2 h-2 rounded-full",
              lastSync ? "bg-black animate-pulse" : "bg-neutral-300"
            )}
          />
          Live stock · synced{" "}
          {lastSync ? new Date(lastSync).toLocaleTimeString() : "—"}
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-neutral-800"
        >
          + New Product
        </button>
      </div>
      <div className="border border-black overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
                Product
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
                Category
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
                Price
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
                Stock
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
                Sold
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  No products
                </td>
              </tr>
            )}
            {products.map((p) => {
              const liveStock = stockMap?.[p.p_id] ?? p.p_stock;
              return (
                <tr
                  key={p.p_id}
                  className="border-t border-neutral-200 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 aspect-square bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                        {p.p_img && (
                          <img
                            src={p.p_img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{p.p_name}</div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                          {p.p_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 uppercase text-xs font-medium">
                    {p.p_category}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold">
                      {formatVnd(p.p_discountPrice || p.p_price)}
                    </div>
                    {p.p_discountPrice > 0 && (
                      <div className="text-xs text-neutral-400 line-through">
                        {formatVnd(p.p_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-bold",
                        liveStock === 0
                          ? "bg-black text-white"
                          : liveStock <= 5
                          ? "bg-white border border-black text-black"
                          : "text-black"
                      )}
                    >
                      {liveStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {p.p_sold || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => onEdit(p)}
                        className="px-3 py-1 text-xs border border-black hover:bg-black hover:text-white uppercase font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="px-3 py-1 text-xs bg-black text-white hover:bg-neutral-700 uppercase font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab({ orders, onStatusChange, stockMap }) {
  return (
    <div className="space-y-3">
      {orders.length === 0 && (
        <div className="py-10 text-center text-neutral-500">No orders yet.</div>
      )}
      {orders.map((o) => (
        <div key={o._id} className="border border-black">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-black text-white">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold">
                #{o._id.slice(-8).toUpperCase()}
              </span>
              <span className="opacity-70">
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </div>
            <select
              value={o.status}
              onChange={(e) => onStatusChange(o._id, e.target.value)}
              className="bg-white text-black text-xs font-bold uppercase tracking-wide px-2 py-1 border-0"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                Customer
              </div>
              <div className="font-semibold">{o.customerName}</div>
              <div className="text-neutral-600">{o.phoneNumber}</div>
              <div className="text-neutral-600">{o.shippingAddress}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                Items
              </div>
              <ul className="divide-y divide-neutral-200">
                {o.products.map((it, i) => {
                  const live = stockMap?.[it.productId];
                  return (
                    <li
                      key={i}
                      className="py-2 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{it.productName}</div>
                        {it.variant && (
                          <div className="text-xs text-neutral-500">
                            {it.variant.replaceAll("|", " · ")}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        ×{it.quantity}
                      </div>
                      <div className="text-sm font-semibold w-28 text-right">
                        {formatVnd(it.price * it.quantity)}
                      </div>
                      {live !== undefined && (
                        <div className="text-[10px] text-neutral-500 w-20 text-right">
                          stock: {live}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="pt-3 mt-3 border-t border-black flex justify-between font-bold">
                <span>Tổng</span>
                <span>{formatVnd(o.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab({ users }) {
  return (
    <div className="border border-black overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-black text-white">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
              Name
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
              Email
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
              Phone
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                No users
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr
              key={u._id}
              className="border-t border-neutral-200 hover:bg-neutral-50"
            >
              <td className="px-4 py-3 font-semibold">{u.name}</td>
              <td className="px-4 py-3 text-neutral-600">{u.email}</td>
              <td className="px-4 py-3 text-neutral-600">{u.phone || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                    u.role === "admin"
                      ? "bg-black text-white"
                      : "border border-black"
                  )}
                >
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const stockMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.p_id, p.p_stock])),
    [products]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "products" || tab === "dashboard") {
        const { data } = await api.get("/admin/products?limit=100");
        setProducts(data.products || []);
      }
      if (tab === "orders") {
        const { data } = await api.get("/admin/orders");
        setOrders(data.orders || []);
      }
      if (tab === "users") {
        const { data } = await api.get("/admin/users");
        setUsers(data.users || []);
      }
      setLastSync(Date.now());
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
    if (tab === "products" || tab === "orders" || tab === "dashboard") {
      const t = setInterval(fetchData, 6000);
      return () => clearInterval(t);
    }
  }, [fetchData, tab]);

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/admin/products/${editing.p_id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.p_name}"?`)) return;
    try {
      await api.delete(`/admin/products/${p.p_id}`);
      fetchData();
    } catch {}
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}`, { status });
      fetchData();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-black">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Console</h1>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Manage products, orders, and users
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-6 border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setShowForm(false);
                setEditing(null);
              }}
              className={cn(
                "px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition border-b-2 -mb-px",
                tab === t.id
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-black"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="border border-black p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 uppercase tracking-wider">
              {editing ? "Edit Product" : "New Product"}
            </h2>
            <ProductForm
              initial={editing}
              submitting={submitting}
              onSubmit={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        {tab === "dashboard" && <DashboardTab />}
        {tab === "products" && (
          <ProductsTab
            products={products}
            loading={loading}
            stockMap={stockMap}
            lastSync={lastSync}
            onAdd={() => {
              setEditing(null);
              setShowForm(true);
            }}
            onEdit={(p) => {
              setEditing(p);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        )}
        {tab === "orders" && (
          <OrdersTab
            orders={orders}
            stockMap={stockMap}
            onStatusChange={handleStatus}
          />
        )}
        {tab === "users" && <UsersTab users={users} />}
      </div>
    </div>
  );
}
