import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { formatVnd } from "../src/lib/utils";

const variantKey = (p_id, variant = "") => `${p_id}__${variant || ""}`;

export default function Cart() {
  const navigate = useNavigate();
  const {
    card, priceCard, totalPrice, handleCheckOut,
    removeCard, products, selectItem, setSelectItem,
    plusMinus, Select,
  } = useContext(CartContext);

  useEffect(() => {
    setSelectItem(card.map((i) => variantKey(i.p_id, i.variant)));
  }, [card.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (i) => {
    const k = variantKey(i.p_id, i.variant);
    setSelectItem((items) => (items.includes(k) ? items.filter((x) => x !== k) : [...items, k]));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-black">
        <h2 className="text-2xl font-black uppercase tracking-tight">Giỏ hàng</h2>
        <button onClick={() => navigate("/")} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">← Tiếp tục mua sắm</button>
      </div>

      {card.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-sm border border-neutral-200">Giỏ hàng trống.</div>
      ) : (
        <div className="border border-black divide-y divide-neutral-200">
          {card.map((cartItem) => {
            const product = products.find((p) => p.p_id === cartItem.p_id);
            if (!product) return null;
            const k = variantKey(cartItem.p_id, cartItem.variant);
            const checked = selectItem.includes(k);
            return (
              <div className="grid grid-cols-12 gap-3 items-center p-4" key={k}>
                <div className="col-span-1 flex justify-center">
                  <input type="checkbox" checked={checked} onChange={() => toggle(cartItem)} className="w-4 h-4 accent-black cursor-pointer" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <div onClick={() => navigate(`/products/${product.p_id}`)} className="aspect-square w-full bg-neutral-50 border border-neutral-200 cursor-pointer overflow-hidden">
                    <img src={product.p_img} alt={product.p_name} className="w-full h-full object-contain p-1" />
                  </div>
                </div>
                <div className="col-span-8 sm:col-span-5">
                  <div onClick={() => navigate(`/products/${product.p_id}`)} className="font-semibold cursor-pointer hover:underline">{product.p_name}</div>
                  {cartItem.variant && <div className="text-xs text-neutral-500 mt-1">{cartItem.variant.replaceAll("|", " · ")}</div>}
                </div>
                <div className="col-span-7 sm:col-span-2 text-sm font-bold">{formatVnd(priceCard(cartItem.p_id, cartItem.variant))}</div>
                <div className="col-span-5 sm:col-span-2 flex items-center gap-1">
                  <button onClick={() => plusMinus(false, cartItem.p_id, cartItem.variant)} className="w-8 h-8 border border-black hover:bg-black hover:text-white">-</button>
                  <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                  <button onClick={() => plusMinus(true, cartItem.p_id, cartItem.variant)} className="w-8 h-8 border border-black hover:bg-black hover:text-white">+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {card.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">Tổng: <span className="text-lg font-black">{formatVnd(totalPrice(Select))}</span></div>
            <button onClick={() => handleCheckOut(Select)} disabled={Select.length === 0} className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-30">
              Thanh toán ({Select.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}