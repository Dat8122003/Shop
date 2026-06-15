import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../src/lib/api";
import { cn } from "../src/lib/utils";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || "/";
  const { setUser, fetchUserProfile } = useContext(CartContext);
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    name: "",
    email: "",
    passWord: "",
  });
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const login = async () => {
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", {
        identifier: form.identifier,
        passWord: form.passWord,
      });
      if (data.error) {
        setError(data.error);
        return;
      }
      localStorage.setItem("token", data.token);
      const { data: pData } = await api.get("/auth/me");
      if (pData?.user) {
        setUser(pData.user);
        await fetchUserProfile();
      }
      toast.success("Chào mừng quay lại");
      navigate(fromPath, { replace: true });
    } catch (e) {
      if (!e.response) setError("Không thể kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const register = async () => {
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        passWord: form.passWord,
      });
      if (data.error) {
        setError(data.error);
        return;
      }
      setIsLogin(true);
      toast.success("Tạo tài khoản thành công. Vui lòng đăng nhập.");
    } catch (e) {
      if (!e.response) setError("Không thể kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isLogin ? login() : register();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md border border-black p-8"
      >
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
          {isLogin ? "Sign in" : "Create account"}
        </h2>
        <div className="space-y-3">
          {isLogin ? (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                Email or Username
              </label>
              <input
                value={form.identifier}
                onChange={update("identifier")}
                required
                autoComplete="username"
                className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Username
                </label>
                <input
                  value={form.name}
                  onChange={update("name")}
                  required
                  autoComplete="username"
                  className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  required
                  autoComplete="email"
                  className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.passWord}
              onChange={update("passWord")}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm"
            />
          </div>
        </div>
        {error && (
          <p className="mt-3 text-xs text-black font-semibold uppercase tracking-wide">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full px-4 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
        </button>
        <div className="mt-4 text-center text-xs text-neutral-600">
          {isLogin ? "No account?" : "Already have one?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin((s) => !s);
              setError("");
            }}
            className="font-bold uppercase tracking-widest text-black hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}