import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../src/lib/api";
import ProductCard from "../components/ProductCard";
import { asList, cn } from "../src/lib/utils";

const mergeStock = (oldList, newList) => {
  if (!oldList.length) return newList;
  const map = new Map(newList.map((p) => [p.p_id, p]));
  return newList.map((fresh) => {
    const old = map.get(fresh.p_id);
    return old ? { ...old, p_stock: fresh.p_stock, p_sold: fresh.p_sold, p_skus: fresh.p_skus || old.p_skus } : fresh;
  });
};

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "b", label: "Ô tô" },
  { id: "c", label: "Xe máy" },
  { id: "d", label: "Mô hình" },
  { id: "e", label: "Anime" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [hot, setHot] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => { setQuery(urlQuery); }, [urlQuery]);

  // Load products + hot song song, nhưng KHÔNG render danh sách nào
  // cho tới khi cả hai xong — tránh hiện "tất cả" trước rồi mới tới "nổi bật".
  const refresh = useCallback(async () => {
    const params = { limit: 48 };
    if (cat && cat !== "all") params.category = cat;
    if (query.trim()) params.search = query.trim();

    const [prodRes, hotRes] = await Promise.allSettled([
      api.get("/products", { params }),
      api.get("/hot?limit=8"),
    ]);
    if (prodRes.status === "fulfilled") {
      setProducts((prev) => mergeStock(prev, asList(prodRes.value.data)));
    }
    if (hotRes.status === "fulfilled") {
      setHot(asList(hotRes.value.data));
    }
  }, [cat, query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refresh]);

  // Tự động refresh stock mỗi 8s — không setLoading để tránh flash skeleton
  useEffect(() => {
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="bg-white text-black">
      <section className="border-b border-black bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">Shop</h1>
        </div>
      </section>

      {hot.length > 0 && !loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-neutral-200">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest">Sản phẩm nổi bật</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Bán chạy nhất</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {hot.map((p) => <ProductCard key={p.p_id} product={p} />)}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-black uppercase tracking-widest">Tất cả sản phẩm</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm..." className="px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-sm w-full sm:w-64" />
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} className={cn("px-3 py-2 text-[11px] font-bold uppercase tracking-widest border transition", cat === c.id ? "bg-black text-white border-black" : "bg-white text-black border-neutral-300 hover:border-black")}>{c.label}</button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-16 text-center text-neutral-500 text-sm">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-sm">Không tìm thấy sản phẩm.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.p_id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}