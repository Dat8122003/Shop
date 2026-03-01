import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const CardContext = createContext();
export function CardProvider({ children }) {
  const [checkOut, setCheckOut] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectCategory, setSelectCategory] = useState(null);
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const card = user ? user?.cart : cart;
  const [selectItem, setSelectItem] = useState([]);

  // Lưu sản phẩm được chọn thanh toán
  const Select = card.filter((item) => selectItem.includes(item.p_id));
  const navigate = useNavigate();

  // Lưu sản phẩm sau thanh toán
  const handleCheckOut = (Select) => {
    setCheckOut(Select);
    navigate("/checkout?mode=cart");
  };

  // Cập  nhật các thuộc tính của tài khoản
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Promise.resolve();
    try {
      const res = await fetch("https://shop-ll18.onrender.com/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.resolve();
    }
  };

  // Cập nhật thông tin đơn hàng
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("https://shop-ll18.onrender.com/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOrders(data.orders);
  };

  // Cập nhật thuộc tính của sản phẩm
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://shop-ll18.onrender.com/products");
      const pro = await res.json();
      setProducts(pro);
      return pro;
    } catch (err) {
      return [];
    }
  };

  // Render sản phẩm theo từ khóa tìm kiếm
  const fetchSearch = async (q) => {
    if (!q) return;
    try {
      const res = await fetch(`https://shop-ll18.onrender.com/search?q=${q}`);
      const json = await res.json();
      const data = json.products;
      setSelectCategory(null);
      setProducts(data);
      return;
    } catch (e) {
      return;
    }
  };

  // Cập nhật thuộc tính tài khoản, sản phẩm, đơn hàng mỗi khi reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      Promise.all([fetchProducts(), fetchUserProfile(), fetchOrders()])
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      fetchProducts()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, []);

  // Thêm sản phẩm vào giỏ
  const addCard = async (p_id) => {
    try {
      const token = localStorage.getItem("token");
      const data = await fetch("https://shop-ll18.onrender.com/update-cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ p_id }),
      }).then((res) => res.json());
      if (data.error) {
        alert("Lỗi thêm giỏ: " + data.error);
      } else if (data.guest) {
        let newCart = [...cart];
        if (newCart.find((item) => item.p_id === data.p_id)) {
          newCart = newCart.map((item) =>
            item.p_id === data.p_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else newCart.push({ p_id: data.p_id, quantity: 1 });
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
      } else if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      alert("Lỗi Web thêm giỏ hàng");
    }
  };

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalCard = card.reduce((sum, item) => sum + item.quantity, 0);

  // Tăng giảm số lượng hàng trong giỏ
  const plusMinus = (state, p_id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      let cart = JSON.parse(localStorage.getItem("cart"));
      const item = cart.find((item) => item.p_id === p_id);
      if (item) {
        state
          ? (item.quantity += 1)
          : item.quantity === 1
          ? (cart = cart.filter((i) => i.p_id !== p_id))
          : (item.quantity -= 1);
      }
      setCart([...cart]);
      localStorage.setItem("cart", JSON.stringify(cart));
      return;
    }
    fetch("https://shop-ll18.onrender.com/plus-minus-cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ state, p_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Lỗi xóa giỏ: " + data.error);
        } else if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Lỗi kết nối remove-cart:", err));
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeCard = (p_id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const cart = JSON.parse(localStorage.getItem("cart"));
      const newCart = cart.filter((item) => item.p_id !== p_id);
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
      return;
    }
    fetch("https://shop-ll18.onrender.com/remove-cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ p_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Lỗi xóa giỏ: " + data.error);
        } else if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Lỗi kết nối remove-cart:", err));
  };

  // Tính tổng giá từ của từng sản phẩm
  const priceCard = (p_id) => {
    const cartItem = card.find((item) => item.p_id === p_id);
    const product = products.find((p) => p.p_id === p_id); // p_id là MongoDB _id
    if (!cartItem || !product) return 0;
    return (product.p_discountPrice || product.p_price) * cartItem.quantity;
  };

  // Tính tổng tiền của các sản phẩm
  const totalPrice = (Select) =>
    Select.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.p_id);
      if (!product) return sum;
      return sum + (product.p_discountPrice || product.p_price) * item.quantity;
    }, 0);

  return (
    <CardContext.Provider
      value={{
        card,
        priceCard,
        addCard,
        totalCard,
        removeCard,
        totalPrice,
        setCheckOut,
        checkOut,
        user,
        setUser,
        loading,
        setLoading,
        products,
        orders,
        fetchOrders,
        fetchProducts,
        selectItem,
        setSelectItem,
        fetchUserProfile,
        plusMinus,
        handleCheckOut,
        Select,
        selectCategory,
        setSelectCategory,
        fetchSearch,
      }}
    >
      {children}
    </CardContext.Provider>
  );
}
