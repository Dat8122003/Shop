import { useContext, useState } from "react";
import { CardContext } from "../context/CardContext";
import { useLocation, useNavigate } from "react-router-dom";
import Cancel from "../components/Cancel";
export default function CheckOut() {
  const navigate = useNavigate();
  const {
    checkOut,
    products,
    removeCard,
    user,
    fetchUserProfile,
    fetchProducts,
    fetchOrders,
  } = useContext(CardContext);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const location = useLocation();
  const mode = new URLSearchParams(location.search).get("mode");

  const totalPrice = checkOut.reduce((sum, item) => {
    const pro = products.find((p) => p._id === item.p_id);
    return sum + (pro.p_discountPrice || pro.p_price) * item.quantity;
  }, 0);

  const completePurchase = async () => {
    if (!customerName || !phoneNumber || !shippingAddress) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://shop-ll18.onrender.com/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          products: checkOut,
          totalPrice,
          customerName,
          phoneNumber,
          shippingAddress,
          mode,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Lỗi thanh toán: " + data.error);
      } else {
        alert("Thanh toán thành công!");
        for (const item of checkOut) {
          removeCard(item.p_id);
        }
        if (token) await fetchUserProfile();
        fetchProducts();
        fetchOrders();
        navigate("/");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };
  return (
    <>
      <Cancel url="/cart" />
      <div className="container mt-3 pb-2">
        <h2 className="text-center mb-4 fw-bold">THANH TOÁN</h2>
        <div className="row">
          <div className="col-md-6">
            <h4>Thông Tin Giao Hàng</h4>
            <div className="mb-3">
              <label className="form-label">Tên khách hàng</label>
              <input
                type="text"
                className="form-control"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Địa chỉ giao hàng</label>
              <textarea
                className="form-control"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <h4>Thông Tin Đơn Hàng</h4>
            <div className="border p-3">
              {checkOut.map((item) => {
                if (item.p_id) {
                  const product = products.find((p) => p.p_id === item.p_id);
                  if (!product) return null;
                  return (
                    <div
                      className="d-flex justify-content-between mb-2"
                      key={item.p_id}
                    >
                      <span>{product.p_name}</span>
                      <span>
                        x{item.quantity || 1} -{" "}
                        {(
                          (product.p_discountPrice || product.p_price) *
                          (item.quantity || 1)
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>
                  );
                }
              })}
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>TỔNG CỘNG:</span>
                <span className="text-danger">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <button className="btn btn-danger" onClick={completePurchase}>
            Thanh Toán
          </button>
        </div>
      </div>
    </>
  );
}
