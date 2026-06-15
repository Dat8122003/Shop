import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../src/lib/api";
import toast from "react-hot-toast";

export default function Account() {
  const navigate = useNavigate();
  const { user, setUser, fetchUserProfile } = useContext(CartContext);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", address: user.address || "" });
  }, [user]);

  const handleLogout = () => { localStorage.removeItem("token"); setUser(null); navigate("/"); };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/me", form);
      if (data?.user) setUser(data.user);
      await fetchUserProfile();
      toast.success("Đã cập nhật thông tin");
    } catch {} finally { setSaving(false); }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500">Bạn chưa đăng nhập.</p>
        <button onClick={() => navigate("/login")} className="mt-4 px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest">Đăng nhập</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl font-black uppercase tracking-tight mb-6 pb-3 border-b border-black">Tài khoản</h2>
      <form onSubmit={handleSave} className="border border-black p-6 space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Họ tên</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Số điện thoại</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Địa chỉ</label>
          <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-neutral-300 focus:border-black focus:outline-none px-3 py-2 text-sm" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Vai trò: {user.role === "admin" ? "Quản trị viên" : user.role === "guest" ? "Khách" : "Người dùng"}</div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200">
          <button type="submit" disabled={saving} className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu"}</button>
          <button type="button" onClick={() => navigate("/history")} className="px-5 py-2 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white">Lịch sử đơn hàng</button>
          <button type="button" onClick={handleLogout} className="px-5 py-2 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white">Đăng xuất</button>
        </div>
      </form>
    </div>
  );
}