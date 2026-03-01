import { useState, useEffect } from "react";

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cập nhật thông tin sản phẩm
  const handleUpdateProduct = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://shop-ll18.onrender.com/admin/products/${editingProduct.p_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.error) {
        alert("Lỗi: " + data.error);
      } else {
        alert("Cập nhật thành công!");
        setEditingProduct(null);

        setFormData({
          p_name: "",
          p_price: "",
          p_discountPrice: "",
          p_img: "",
          p_stock: "",
          p_category: "a",
          p_description: "",
        });

        fetchData();
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // Sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditingProduct(product);

    setFormData({
      p_name: product.p_name,
      p_price: product.p_price,
      p_discountPrice: product.p_discountPrice,
      p_img: product.p_img,
      p_stock: product.p_stock,
      p_category: product.p_category,
      p_description: product.p_description,
    });
  };
  const [formData, setFormData] = useState({
    p_name: "",
    p_price: "",
    p_discountPrice: "",
    p_img: "",
    p_stock: "",
    p_category: "a",
    p_description: "",
  });

  // render dữ liệu sau khi reload
  useEffect(() => {
    fetchData();
  }, [tab]);

  // render dữ liệu
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      if (tab === "products") {
        const res = await fetch(
          "https://shop-ll18.onrender.com/admin/products",
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        const data = await res.json();
        setProducts(data.products || []);
      } else if (tab === "orders") {
        const res = await fetch("https://shop-ll18.onrender.com/admin/orders", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setOrders(data.orders || []);
      } else if (tab === "users") {
        const res = await fetch("https://shop-ll18.onrender.com/admin/users", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      alert("Lỗi tải dữ liệu:", err);
    }
  };

  // Thêm sản phẩm
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://shop-ll18.onrender.com/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) {
        alert("Lỗi: " + data.error);
      } else {
        alert("Thêm sản phẩm thành công!");
        setFormData({
          p_name: "",
          p_price: "",
          p_discountPrice: "",
          p_img: "",
          p_stock: "",
          p_category: "a",
          p_description: "",
        });
        fetchData();
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Xác nhận xóa?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://shop-ll18.onrender.com/admin/products/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        }
      );
      const data = await res.json();
      if (data.error) {
        alert("Lỗi: " + data.error);
      } else {
        alert("Xóa thành công!");
        fetchData();
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // Cập nhật đơn hàng
  const handleUpdateOrderStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://shop-ll18.onrender.com/admin/orders/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.error) {
        alert("Lỗi: " + data.error);
      } else {
        fetchData();
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  return (
    <div className="container-fluid mt-5">
      <h1 className="mb-4">Trang admin</h1>
      <div className="btn-group mb-4">
        <button
          className={`btn ${
            tab === "products" ? "btn-dark" : "btn-light border border-dark"
          }`}
          onClick={() => setTab("products")}
        >
          Sản phẩm
        </button>
        <button
          className={`btn ${
            tab === "orders" ? "btn-dark" : "btn-light border border-dark"
          }`}
          onClick={() => setTab("orders")}
        >
          Đơn hàng
        </button>
        <button
          className={`btn ${
            tab === "users" ? "btn-dark" : "btn-light border border-dark"
          }`}
          onClick={() => setTab("users")}
        >
          Users
        </button>
      </div>
      {tab === "products" && (
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-dark text-white">
                Thêm sản phẩm mới
              </div>
              <div className="card-body">
                <form onSubmit={handleAddProduct}>
                  <div className="mb-3">
                    <label className="form-label">Tên sản phẩm</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.p_name}
                      onChange={(e) =>
                        setFormData({ ...formData, p_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giá</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.p_price}
                      onChange={(e) =>
                        setFormData({ ...formData, p_price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giá khuyến mãi</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.p_discountPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          p_discountPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">URL ảnh</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.p_img}
                      onChange={(e) =>
                        setFormData({ ...formData, p_img: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số lượng</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.p_stock}
                      onChange={(e) =>
                        setFormData({ ...formData, p_stock: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Danh mục</label>
                    <select
                      className="form-control"
                      value={formData.p_category}
                      onChange={(e) =>
                        setFormData({ ...formData, p_category: e.target.value })
                      }
                    >
                      <option value="b">Mô hình xe</option>
                      <option value="c">Mô hình Motor</option>
                      <option value="d">Mô hình nhân vật</option>
                      <option value="e">Mô hình hoạt hình</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      value={formData.p_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          p_description: e.target.value,
                        })
                      }
                    />
                  </div>
                  {editingProduct ? (
                    <button
                      type="button"
                      className="btn btn-dark w-100"
                      onClick={handleUpdateProduct}
                    >
                      Cập nhật sản phẩm
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-light border border-dark w-100"
                    >
                      Thêm sản phẩm
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-dark text-white">
                Danh sách sản phẩm ({products.length})
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.p_id}>
                          <td>{p.p_name}</td>
                          <td>{p.p_price.toLocaleString()}đ</td>
                          <td>{p.p_stock}</td>
                          <td>
                            <button
                              className="btn btn-light border border-dark me-2"
                              onClick={() => handleEditProduct(p)}
                            >
                              Sửa
                            </button>

                            <button
                              className="btn btn-dark"
                              onClick={() => handleDeleteProduct(p.p_id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="card">
          <div className="card-header bg-dark text-white">
            Danh sách đơn hàng ({orders.length})
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="text-center">ID</th>
                    <th>Khách hàng</th>
                    <th>SĐT</th>
                    <th>Sản phẩm</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-center">Tổng tiền</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="text-center">{o._id.substring(0, 8)}</td>
                      <td>{o.customerName}</td>
                      <td>{o.phoneNumber}</td>
                      <td>
                        {o.products.map((p) => (
                          <div key={p.productId}>{p.productName}</div>
                        ))}
                      </td>

                      <td className="text-center">
                        {o.products.map((p) => (
                          <div key={p.productId}>{p.quantity}</div>
                        ))}
                      </td>
                      <td className="text-center">
                        {o.totalPrice.toLocaleString()}đ
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge bg-${
                            o.status === "Hoàn thành"
                              ? "dark"
                              : o.status === "Đang đợi"
                              ? "secondary"
                              : "light text-dark border border-dark"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={o.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(o._id, e.target.value)
                          }
                        >
                          <option value="Đang đợi">Chưa xác nhận</option>
                          <option value="Hoàn thành">Đã hoàn thành</option>
                          <option value="Thất bại">Thất bại</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="card">
          <div className="card-header bg-dark text-white">
            Danh sách Users ({users.length})
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>SĐT</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            u.role === "admin" ? "dark" : "light text-dark"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
