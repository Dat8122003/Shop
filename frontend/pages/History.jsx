import { useContext, useEffect } from "react";
import { CardContext } from "../context/CardContext";
import Cancel from "../components/Cancel";
export default function History() {
  const { orders, fetchOrders } = useContext(CardContext);
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Cancel url="/" />
      <div className="container mt-3 pb-2">
        <h2 className="text-center mb-3 fw-bold">LỊCH SỬ MUA HÀNG</h2>
        {orders.length === 0 ? (
          <p className="text-center">Bạn chưa có đơn hàng nào</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between">
                  <span>Đơn hàng #{order._id.substring(0, 8)}</span>
                  <span className="badge bg-dark p-2">{order.status}</span>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Thông tin giao hàng</h6>
                    <p>
                      <strong>Tên:</strong> {order.customerName}
                    </p>
                    <p>
                      <strong>SĐT:</strong> {order.phoneNumber}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {order.shippingAddress}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Chi tiết đơn hàng</h6>
                    {!order.products || order.products.length === 0 ? (
                      <p className="text-muted">Không có thông tin sản phẩm</p>
                    ) : (
                      <>
                        {order.products.map((item, idx) => (
                          <div
                            key={idx}
                            className="d-flex justify-content-between"
                          >
                            <span>
                              {item.productName || "N/A"} x{item.quantity || 1}
                            </span>
                            <span>
                              {(
                                (item.price || 0) * (item.quantity || 1)
                              ).toLocaleString()}
                              đ
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-danger">
                        {(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    Ngày đặt:{" "}
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
