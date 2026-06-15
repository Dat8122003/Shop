import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../src/lib/api";
import { asList, priceOf, variantKey } from "../src/lib/utils";

export const CartContext = createContext();

const sameItem = (i, p_id, variant) =>
  i.p_id === p_id && (i.variant || "") === (variant || "");

const loadGuestCart = () => {
  try { return JSON.parse(localStorage.getItem("cart")) || []; }
  catch { return []; }
};

const saveGuestCart = (c) => {
  localStorage.setItem("cart", JSON.stringify(c));
};

export function CartProvider({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(loadGuestCart);
  const [selectItem, setSelectItem] = useState([]);
  const [checkOut, setCheckOut] = useState([]);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.p_id, p])),
    [products]
  );

  const card = user ? user.cart : cart;

  const Select = useMemo(
    () => card.filter((i) => selectItem.includes(variantKey(i.p_id, i.variant))),
    [card, selectItem]
  );

  useEffect(() => {
    const tasks = [api.get("/products").then((r) => setProducts(asList(r.data)))];
    if (token) {
      tasks.push(
        api.get("/auth/me").then(async (r) => { if (r.data?.user) { setUser(r.data.user); await mergeGuestCart(r.data.user); } }).catch(() => {}),
        api.get("/orders").then((r) => setOrders(asList(r.data))).catch(() => {})
      );
    } else {
      setOrders([]);
      setSelectItem([]);
    }
    Promise.allSettled(tasks).finally(() => setLoading(false));
  }, [token]);

  const fetchProducts = useCallback(async () => {
    const { data } = await api.get("/products");
    const list = asList(data);
    setProducts(list);
    return list;
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get("/auth/me");
    if (data?.user) setUser(data.user);
  }, [token]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get("/orders");
    setOrders(asList(data));
  }, [token]);


  // Sau khi login: gá»™p giá» hÃ ng khÃ¡ch (localStorage) vÃ o giá» user (server)
  const mergeGuestCart = async (userObj) => {
    const guestCart = loadGuestCart();
    if (!guestCart.length) return;
    for (const it of guestCart) {
      try {
        await api.post("/cart", { p_id: it.p_id, variant: it.variant || "", quantity: it.quantity || 1 });
      } catch {}
    }
    saveGuestCart([]);
    // Reload user profile Ä‘á»ƒ láº¥y cart má»›i nháº¥t
    try {
      const { data } = await api.get("/auth/me");
      if (data?.user) setUser(data.user);
    } catch {}
  };
  const addCard = async (p_id, variant = "", quantity = 1) => {
    if (!user) {
      const exists = cart.find((i) => sameItem(i, p_id, variant));
      const next = exists
        ? cart.map((i) => (sameItem(i, p_id, variant) ? { ...i, quantity: i.quantity + quantity } : i))
        : [...cart, { p_id, variant, quantity }];
      setCart(next);
      saveGuestCart(next);
      toast.success("ÄÃ£ thÃªm vÃ o giá»");
      return;
    }
    const { data } = await api.post("/cart", { p_id, variant, quantity });
    if (data?.user) setUser(data.user);
    toast.success("ÄÃ£ thÃªm vÃ o giá»");
  };

  const plusMinus = async (state, p_id, variant = "") => {
    if (!user) {
      const cap = productMap.get(p_id)?.p_stock ?? Infinity;
      const next = cart
        .map((i) => {
          if (!sameItem(i, p_id, variant)) return i;
          const q = state ? Math.min(cap, i.quantity + 1) : i.quantity - 1;
          return q > 0 ? { ...i, quantity: q } : null;
        })
        .filter(Boolean);
      setCart(next);
      saveGuestCart(next);
      return;
    }
    const { data } = await api.patch("/cart/toggle", { state, p_id, variant });
    if (data?.user) setUser(data.user);
  };

  const removeCard = async (p_id, variant = "") => {
    if (!user) {
      const next = cart.filter((i) => !sameItem(i, p_id, variant));
      setCart(next);
      saveGuestCart(next);
      return;
    }
    const { data } = await api.delete(`/cart/${p_id}?variant=${encodeURIComponent(variant || "")}`);
    if (data?.user) setUser(data.user);
  };

  const handleCheckOut = (items) => {
    setCheckOut(items);
    navigate("/checkout?mode=cart");
  };

  const priceCard = (p_id, variant = "") => {
    const item = card.find((i) => sameItem(i, p_id, variant));
    const p = productMap.get(p_id);
    return item && p ? priceOf(p) * item.quantity : 0;
  };

  const totalPrice = (items) =>
    items.reduce((s, i) => {
      const p = productMap.get(i.p_id) || products.find((x) => x._id === i.p_id);
      return p ? s + priceOf(p) * i.quantity : s;
    }, 0);

  const totalCard = card.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        card, products, orders, user, loading,
        checkOut, selectItem, Select, totalCard,
        setUser, setProducts, setSelectItem, setCheckOut,
        addCard, plusMinus, removeCard, handleCheckOut,
        fetchProducts, fetchUserProfile, fetchOrders,
        priceCard, totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
