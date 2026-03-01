import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CardContext } from "../context/CardContext";
export default function Login() {
  const { setUser } = useContext(CardContext);
  const [stateSignIn, setStateSignIn] = useState(true);
  const [resultSign, setResultSign] = useState(true);
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  async function register() {
    const res = await fetch("https://shop-ll18.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
        passWord,
        email,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setResultSign(false);
      return;
    }
    setStateSignIn(!stateSignIn);
    setResultSign(true);
  }
  async function handleLogin() {
    const res = await fetch("https://shop-ll18.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        passWord,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setResultSign(false);
    }
    localStorage.setItem("token", data.token);
    const dataUser = await fetch("https://shop-ll18.onrender.com/profile", {
      headers: { Authorization: "Bearer " + data.token },
    }).then((res) => res.json());
    if (dataUser.user) {
      setUser(dataUser.user);
      document.body.style.overflow = "auto";
      navigate("/");
    }
  }
  return (
    <>
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card shadow-lg rounded col-md-6 col-lg-4">
          <div className="card-header text-center h3 fw-bold">
            {stateSignIn ? "Đăng nhập" : "Đăng ký"}
          </div>
          <div className="card-body">
            <form>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Tài khoản"
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <label htmlFor="username">Tài khoản</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Mật khẩu"
                  onChange={(e) => setPassWord(e.target.value)}
                  required
                />
                <label htmlFor="password">Mật khẩu</label>
              </div>
              {!stateSignIn && (
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập Email"
                    className="form-control"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                </div>
              )}
              <div className="card-footer text-center">
                {stateSignIn ? "Chưa có tài khoản?" : "Đăng nhập ngay"}
                <span
                  onClick={() => {
                    setStateSignIn(!stateSignIn);
                    setResultSign(true);
                  }}
                  className="text-success"
                >
                  {stateSignIn ? " Đăng ký" : " Đăng nhập"}
                </span>
              </div>
              <div className="d-grid">
                {!resultSign && (
                  <p className="text-center text-danger">
                    {!stateSignIn ? "Đăng kí thất bại" : "Đăng nhập thất bại"}
                  </p>
                )}
                <button
                  className="btn btn-dark shadow"
                  onClick={(e) => {
                    e.preventDefault();
                    stateSignIn ? handleLogin() : register();
                  }}
                >
                  {!stateSignIn ? "Đăng ký" : "Đăng nhập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
