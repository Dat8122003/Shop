import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { formatVnd, cn } from "../src/lib/utils";

const STATUS_LABEL = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
};

const statusStyle = (s) => {
  if (s === "Delivered") return "bg-black text-white";
  if (s === "Cancelled") return "bg-white text-black border border-black line-through";
  if (s === "Shipping") return "bg-neutral-200 text-black";
  return "bg-white text-black border border-black";
};

export default function History() {
  const navigate = useNavigate();
  const { orders, fetchOrders } = useContext(CartContext);

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 8000);
    return () => clearInterval(t);
  }, [fetchOrders]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-black">
        <h2 className="text-2xl font-black uppercase tracking-tight">Lịch sử đơn hàng</h2>
        <button onClick={() => navigate("/")} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">← Quay lại</button>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-sm border border-neutral-200">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border border-black">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-black text-white">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="opacity-70">{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", statusStyle(order.status))}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="md:col-span-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Giao đến</div>
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-neutral-600">{order.phoneNumber}</div>
                  <div className="text-neutral-600">{order.shippingAddress}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Sản phẩm</div>
                  <ul className="divide-y divide-neutral-200">
                    {(order.products || []).map((it, idx) => (
                      <li key={idx} className="py-2 flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{it.productName || "Không rõ"}</div>
                          {it.variant && <div className="text-xs text-neutral-500">{it.variant.replaceAll("|", " · ")}</div>}
                        </div>
                        <div className="text-xs text-neutral-500">×{it.quantity || 1}</div>
                        <div className="font-semibold w-32 text-right">{formatVnd((it.price || 0) * (it.quantity || 1))}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 mt-3 border-t border-black flex justify-between font-bold">
                    <span className="uppercase tracking-widest text-xs">Tổng</span>
                    <span>{formatVnd(order.totalPrice || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}