import { useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api, { cn, formatVnd } from "../src/lib/api";
import { asList, priceOf, skuKey } from "../src/lib/utils";
import { CartContext } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

// ============ Inline SVG icons ============
const Icon = ({ d, className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{d}</svg>
);
const ChevronLeft  = (p) => <Icon {...p} d={<polyline points="15 18 9 12 15 6" />} />;
const ChevronRight = (p) => <Icon {...p} d={<polyline points="9 18 15 12 9 6" />} />;
const Star         = (p) => <Icon {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />} />;
const ChevronDown  = (p) => <Icon {...p} d={<polyline points="6 9 12 15 18 9" />} />;
const ArrowLeft    = (p) => <Icon {...p} d={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />;

// ============ Stars (display + picker) ============
const Stars = ({ value = 0, size = "h-4 w-4" }) => (
  <span className="inline-flex gap-0.5 text-black">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={cn(size, i <= Math.round(value) ? "" : "text-neutral-300")} />
    ))}
  </span>
);
const StarPicker = ({ value, onChange, size = "h-6 w-6" }) => {
  const [hover, setHover] = useState(0);
  const v = hover || value;
  return (
    <span className="inline-flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onMouseEnter={() => setHover(i)} onClick={() => onChange(i)} className="p-0.5">
          <Star className={cn(size, i <= v ? "text-black" : "text-neutral-300")} />
        </button>
      ))}
    </span>
  );
};

// ============ Image gallery (no zoom, contain) ============
const ImageGallery = ({ images, alt }) => {
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [images.join("|")]);
  if (!images.length) {
    return <div className="aspect-square bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs uppercase tracking-widest text-neutral-400">Không có ảnh</div>;
  }
  return (
    <div className="flex gap-3 flex-col-reverse md:flex-row md:items-start">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[480px] md:w-20 shrink-0">
        {images.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "w-16 h-16 md:w-20 md:h-20 shrink-0 border-2 bg-white overflow-hidden",
              i === active ? "border-black" : "border-neutral-200 hover:border-neutral-400"
            )}
          >
            <img src={url} alt="" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
      <div className="relative flex-1 max-h-[480px] aspect-square bg-white border border-neutral-200 overflow-hidden">
        <img src={images[active]} alt={alt} className="w-full h-full object-contain" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => setActive((a) => (a - 1 + images.length) % images.length)} aria-label="Ảnh trước" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white border border-black flex items-center justify-center">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setActive((a) => (a + 1) % images.length)} aria-label="Ảnh sau" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white border border-black flex items-center justify-center">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold">{active + 1}/{images.length}</span>
      </div>
    </div>
  );
};

// ============ SKU selector ============
const SkuSelector = ({ attributes, skus, selected, onChange }) => {
  if (!attributes?.length) return null;
  return (
    <div className="space-y-3">
      {attributes.map((attr) => (
        <div key={attr.name}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
            {attr.name}{selected[attr.name] && <span className="text-black ml-1">: {selected[attr.name]}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attr.options.map((opt) => {
              const test = { ...selected, [attr.name]: opt };
              const sku = skus.find((s) => skuKey(s.combo) === skuKey(test));
              const out = !sku || Number(sku.stock) <= 0;
              const active = selected[attr.name] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ ...selected, [attr.name]: opt })}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold border transition",
                    active ? "bg-black text-white border-black" : "bg-white text-black border-neutral-300 hover:border-black",
                    out && !active && "opacity-40 line-through"
                  )}
                >{opt}</button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============ Review list ============
const ReviewList = ({ reviews }) => {
  if (!reviews.length) return <p className="text-sm text-neutral-500">Chưa có đánh giá. Hãy là người đầu tiên.</p>;
  return (
    <ul className="divide-y divide-neutral-200">
      {reviews.map((r) => (
        <li key={r._id} className="py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">{r.userId?.name || "Khách"}</span>
            <Stars value={r.rating} />
          </div>
          <p className="text-sm text-neutral-700">{r.comment || <em className="text-neutral-400">Không có nhận xét</em>}</p>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wide mt-1">{new Date(r.createdAt).toLocaleString("vi-VN")}</div>
        </li>
      ))}
    </ul>
  );
};

// ============ Main page ============
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addCard, setCheckOut } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [hot, setHot] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState({});
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, r, h, rv] = await Promise.allSettled([
      api.get(`/products/${id}`),
      api.get(`/recommend?ids=${id}&limit=8`),
      api.get(`/hot?limit=8`),
      api.get(`/products/${id}/reviews`),
    ]);
    setProduct(p.status === "fulfilled" ? p.value?.data?.product : null);
    setRecs(r.status === "fulfilled" ? asList(r.value.data) : []);
    setHot(h.status === "fulfilled" ? asList(h.value.data).filter((x) => x.p_id !== id) : []);
    setReviews(rv.status === "fulfilled" ? asList(rv.value.data) : []);
    setLoading(false);
  }, [id]);
  useEffect(() => { loadAll(); window.scrollTo(0, 0); }, [loadAll]);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        const fresh = data?.product;
        if (!fresh) return;
        setProduct((p) => p ? { ...p, p_stock: fresh.p_stock, p_sold: fresh.p_sold, p_skus: fresh.p_skus || p.p_skus } : p);
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [id]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const out = [];
    const seen = new Set();
    [product.p_img, ...(product.p_images || [])].filter(Boolean).forEach((u) => { if (!seen.has(u)) { seen.add(u); out.push(u); } });
    return out;
  }, [product]);

  const activeSku = useMemo(() => {
    if (!product?.p_skus?.length || !Object.keys(selected).length) return null;
    return product.p_skus.find((s) => skuKey(s.combo) === skuKey(selected)) || null;
  }, [product, selected]);
  const finalPrice = useMemo(() => (product ? priceOf(product) + (activeSku ? Number(activeSku.priceAdjust || 0) : 0) : 0), [product, activeSku]);
  const liveStock = activeSku ? Number(activeSku.stock || 0) : Number(product?.p_stock || 0);
  const variantString = activeSku ? skuKey(activeSku.combo) : "";

  const handleBuyNow = () => { setCheckOut([{ p_id: product.p_id, variant: variantString, quantity: 1 }]); navigate("/checkout?mode=buynow"); };
  const handleAddCart = async () => { try { await addCard(product.p_id, variantString, 1); } catch {} };
  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating });
      setReviewRating(5);
      await loadAll();
      toast.success("Cảm ơn bạn đã đánh giá");
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin" /></div>;
  }
  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black tracking-tight">Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate("/")} className="mt-4 px-5 py-2 border border-black text-sm font-semibold uppercase tracking-wide">Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black mb-3 inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="lg:sticky lg:top-4 self-start">
            <ImageGallery images={allImages} alt={product.p_name} />
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                {product.p_category} · Mã {product.p_id.slice(-6)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{product.p_name}</h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-neutral-500">
                <Stars value={product.p_ratingAvg || 0} size="h-3.5 w-3.5" />
                <span>({product.p_ratingCount || 0} đánh giá)</span>
                <span>· Đã bán {product.p_sold || 0}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 pb-3 border-b border-black">
              <span className="text-3xl font-black tracking-tight">{formatVnd(finalPrice)}</span>
              {Number(product.p_discountPrice) > 0 && !activeSku && (
                <span className="text-base text-neutral-400 line-through">{formatVnd(product.p_price)}</span>
              )}
            </div>

            <SkuSelector attributes={product.p_attributes} skus={product.p_skus} selected={selected} onChange={setSelected} />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Tồn kho</span>
              <span className={cn("px-2 py-0.5 text-xs font-bold", liveStock === 0 ? "bg-black text-white" : liveStock <= 5 ? "bg-white border border-black" : "text-black")}>
                {liveStock === 0 ? "Hết hàng" : `Còn ${liveStock}`}
              </span>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={handleBuyNow} disabled={liveStock === 0} className="flex-1 px-5 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 disabled:opacity-30">
                {liveStock === 0 ? "Hết hàng" : "Mua ngay"}
              </button>
              <button type="button" onClick={handleAddCart} disabled={liveStock === 0} className="flex-1 px-5 py-3 border border-black text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white disabled:opacity-30">
                Thêm vào giỏ
              </button>
            </div>

            <details className="border border-neutral-200 group" open>
              <summary className="px-4 py-3 cursor-pointer text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                Mô tả sản phẩm
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
                {product.p_description || "Chưa có mô tả."}
              </div>
            </details>
          </div>
        </div>

        <section className="mt-12 border-t border-black pt-6">
          <h2 className="text-lg font-black uppercase tracking-widest mb-4">Đánh giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2"><ReviewList reviews={reviews} /></div>
            <form onSubmit={submitReview} className="border border-black p-4 h-fit space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest">Đánh giá</h3>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Số sao</div>
                <StarPicker value={reviewRating} onChange={setReviewRating} size="h-5 w-5" />
              </div>
              <button type="submit" disabled={submitting} className="w-full px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50">
                {submitting ? "Đang gửi..." : user ? "Gửi" : "Đăng nhập"}
              </button>
            </form>
          </div>
        </section>

        {recs.length > 0 && (
          <section className="mt-12 border-t border-black pt-6">
            <h2 className="text-lg font-black uppercase tracking-widest mb-4">Có thể bạn cũng thích</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{recs.map((p) => <ProductCard key={p.p_id} product={p} />)}</div>
          </section>
        )}

        {hot.length > 0 && (
          <section className="mt-12 border-t border-black pt-6 pb-6">
            <h2 className="text-lg font-black uppercase tracking-widest mb-4">Sản phẩm bán chạy</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{hot.slice(0, 4).map((p) => <ProductCard key={p.p_id} product={p} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}