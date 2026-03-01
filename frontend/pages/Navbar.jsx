import { CardContext } from "../context/CardContext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const {
    setSelectCategory,
    totalCard,
    setUser,
    user,
    fetchSearch,
    fetchProducts,
  } = useContext(CardContext);
  const catagory = async (c) => {
    setQuery("");
    await fetchProducts();
    setSelectCategory(c);
  };
  const search = async (e) => {
    if (!e) {
      catagory(null);
    } else {
      await fetchSearch(query);
    }
  };
  const home = async () => {
    await fetchProducts();
    navigate("/");
    catagory(null);
    setQuery("");
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    home();
  };
  return (
    <>
      <nav className="navbar sticky-top bg-light">
        <div className="container-fluid gap-1 border">
          <div className="d-flex justify-content-between w-100">
            <div className="d-flex flex-column flex-md-row flex-grow-1 gap-2 me-3">
              <button
                className="btn btn-light border border-dark fw-bold align-self-start text-nowrap"
                onClick={home}
              >
                TRANG CHỦ
              </button>
              <button
                className="btn btn-dark d-none d-md-block text-nowrap"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#category"
              >
                Danh mục sản phẩm
              </button>
              <div className="input-group flex-grow-1">
                <input
                  type="text"
                  className="form-control "
                  placeholder="Tìm kiếm sản phẩm..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") search(query);
                  }}
                />
                <button
                  className="btn btn-dark"
                  onClick={(e) => {
                    search(query);
                  }}
                >
                  {">"}
                </button>
              </div>
            </div>
            <div className="d-flex gap-2">
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-dark"
                  onClick={() => navigate("/cart")}
                >
                  Giỏ: {totalCard}
                </button>
                <button
                  className="btn btn-dark align-self-end d-md-none"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#menuMobile"
                >
                  Menu
                </button>
              </div>
              <button
                className="btn btn-dark d-none d-md-block"
                onClick={() => (user ? "" : navigate("/login"))}
                data-bs-toggle="offcanvas"
                data-bs-target="#account"
                type="button"
              >
                {user?.name || "Đăng nhập"}
              </button>
            </div>
          </div>
          <div className="offcanvas offcanvas-start" id="menuMobile">
            <div className="offcanvas-header">
              <h5>Menu</h5>
              <button
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>
            <div className="offcanvas-body d-flex flex-column gap-2">
              <button
                className="btn btn-light border border-dark  "
                onClick={() => (user ? "" : navigate("/login"))}
                data-bs-toggle="offcanvas"
                data-bs-target="#account"
                type="button"
              >
                {user?.name || "Đăng nhập"}
              </button>
              <button
                className="btn btn-light border border-dark  "
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#category"
              >
                Danh mục sản phẩm
              </button>
            </div>
          </div>

          <div className="offcanvas offcanvas-start" id="category">
            <div className="offcanvas-header">
              <h5>Danh mục sản phẩm</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>

            <div className="offcanvas-body d-flex flex-column gap-1">
              <button
                onClick={() => catagory(null)}
                data-bs-dismiss="offcanvas"
                className="btn btn-light border border-dark"
              >
                Tất cả
              </button>
              <button
                onClick={() => {
                  catagory("b");
                }}
                data-bs-dismiss="offcanvas"
                className="btn btn-light border border-dark"
              >
                Mô hình xe
              </button>
              <button
                onClick={() => catagory("c")}
                data-bs-dismiss="offcanvas"
                className="btn btn-light border border-dark"
              >
                Mô hình Motor
              </button>
              <button
                onClick={() => catagory("d")}
                data-bs-dismiss="offcanvas"
                className="btn btn-light border border-dark"
              >
                Mô hình nhân vật
              </button>
            </div>
          </div>
          <div className="offcanvas offcanvas-start" id="account">
            <div className="offcanvas-header">
              <h5>Tài khoản</h5>
              <button
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>
            <div className="offcanvas-body d-flex flex-column gap-2">
              <button
                className="btn btn-light border border-dark   "
                onClick={() => navigate(user ? "/account" : "/login")}
                data-bs-dismiss="offcanvas"
              >
                Tài khoản của tôi
              </button>
              <button
                className="btn btn-light border border-dark  "
                data-bs-dismiss="offcanvas"
                onClick={() => navigate(user ? "/history" : "/login")}
              >
                Lịch sử mua hàng
              </button>
              {user?.role === "admin" && (
                <button
                  className="btn btn-light border border-dark  "
                  data-bs-dismiss="offcanvas"
                  onClick={() => navigate("/admin")}
                >
                  Trang quản lý
                </button>
              )}
              <button
                className="btn btn-light border border-dark  "
                data-bs-dismiss="offcanvas"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
