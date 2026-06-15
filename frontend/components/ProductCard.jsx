import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { formatVnd, cn } from "../src/lib/utils";

export default function ProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const { addCard, setCheckOut } = useContext(CartContext);
  const hasSale = Number(product?.p_discountPrice) > 0;
  const outOfStock = !Number(product?.p_stock);
  const hasVariants = Array.isArray(product?.p_skus) && product.p_skus.length > 0;

  const buyNow = () => {
    if (hasVariants) { navigate(`/products/${product.p_id}`); return; }
    setCheckOut([{ p_id: product.p_id, variant: "", quantity: 1 }]);
    navigate("/checkout?mode=buynow");
  };

  return (
    <div className={cn("group border border-neutral-200 bg-white hover:border-black transition flex flex-col", compact && "h-full")}>
      <div onClick={() => navigate(`/products/${product.p_id}`)} className="relative aspect-square overflow-hidden bg-neutral-50 cursor-pointer">
        {product.p_img ? (
          <img src={product.p_img} alt={product.p_name} loading="lazy" className="w-full h-full object-contain p-2" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-4xl">—</div>
        )}
        {hasSale && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest">Giảm giá</span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-bold uppercase tracking-widest">Hết hàng</span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 onClick={() => navigate(`/products/${product.p_id}`)} className="text-sm font-semibold line-clamp-2 cursor-pointer hover:underline min-h-[2.5rem]">{product.p_name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-black">{formatVnd(hasSale ? product.p_discountPrice : product.p_price)}</span>
          {hasSale && <span className="text-xs text-neutral-400 line-through">{formatVnd(product.p_price)}</span>}
        </div>
        {!compact && (
          <div className="mt-3 flex gap-1.5">
            <button onClick={buyNow} disabled={outOfStock} className="flex-1 px-2 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-30">Mua</button>
            <button onClick={() => addCard(product.p_id, "", 1)} disabled={outOfStock} className="flex-1 px-2 py-1.5 border border-black text-black text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:text-white disabled:opacity-30">Thêm</button>
          </div>
        )}
      </div>
    </div>
  );
}