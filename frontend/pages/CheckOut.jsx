import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../src/lib/api";
import { formatVnd, priceOf } from "../src/lib/utils";
import toast from "react-hot-toast";

export default function CheckOut() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkOut, products, user, fetchUserProfile, fetchProducts, fetchOrders, removeCard } = useContext(CartContext);

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [submitting, setSubmitting] = useState(false);
  const mode = new URLSearchParams(location.search).get("mode");

  useEffect(() => {
    if (user) {
      setCustomerName((v) => v || user.name || "");
      setPhoneNumber((v) => v || user.phone || "");
      setShippingAddress((v) => v || user.address || "");
    }
  }, [user]);

  const totalPrice = (checkOut || []).reduce((sum, item) => {
    const pro = products.find((p) => p.p_id === item.p_id);
    if (!pro) return sum;
    const base = priceOf(pro);
    let adjust = 0;
    if (item.variant) {
      const sku = (pro.p_skus || []).find((s) => {
        const k = Object.keys(s.combo || {}).sort().map((kk) => `${kk}:${s.combo[kk]}`).join("|");
        return k === item.variant;
      });
      if (sku) adjust = Number(sku.priceAdjust || 0);
    }
    return sum + (base + adjust) * (item.quantity || 1);
  }, 0);

  const completePurchase = async () => {
    if (!customerName || !phoneNumber || !shippingAddress) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/create-order", { products: checkOut, totalPrice, customerName, phoneNumber, shippingAddress, mode });
      if (data.error) { toast.error(data.error); return; }
      toast.success("Đặt hàng thành công");
      for (const item of checkOut) removeCard(item.p_id, item.variant);
      if (user) await fetchUserProfile();
      fetchProducts();
      fetchOrders();
      navigate("/");
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-black">
        <h2 className="text-2xl font-black uppercase tracking-tight">Thanh toán</h2>
        <button onClick={() => navigate("/cart")} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">← Quay lại giỏ hàng</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-neutral-200 pb-2">Thông tin giao hàng</h3>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Họ tên</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Số điện thoại</label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Địa chỉ</label>
            <textarea rows={4} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-neutral-200 pb-2 mb-4">Đơn hàng</h3>
          <div className="border border-black divide-y divide-neutral-200">
            {(checkOut || []).map((item) => {
              const product = products.find((p) => p.p_id === item.p_id);
              if (!product) return null;
              return (
                <div className="flex items-center justify-between p-3 text-sm" key={`${item.p_id}-${item.variant}`}>
                  <div className="flex-1">
                    <div className="font-medium">{product.p_name}</div>
                    {item.variant && <div className="text-xs text-neutral-500">{item.variant.replaceAll("|", " · ")}</div>}
                  </div>
                  <div className="text-xs text-neutral-500 mx-3">×{item.quantity || 1}</div>
                  <div className="font-semibold w-32 text-right">{formatVnd(priceOf(product) * (item.quantity || 1))}</div>
                </div>
              );
            })}
            <div className="p-3 flex justify-between font-bold border-t-2 border-black bg-neutral-50">
              <span className="uppercase tracking-widest text-xs">Tổng cộng</span>
              <span>{formatVnd(totalPrice)}</span>
            </div>
          </div>

          <button onClick={completePurchase} disabled={submitting} className="w-full mt-6 px-6 py-3.5 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 disabled:opacity-50">
            {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}