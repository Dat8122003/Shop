import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, totalCard, setSelectItem } = useContext(CartContext);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const goHome = () => { setSelectItem([]); navigate("/"); };
  const handleSearch = (e) => {
    e?.preventDefault();
    if (!search.trim()) return;
    navigate(`/?q=${encodeURIComponent(search)}`);
    setOpen(false);
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSelectItem([]);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <button onClick={goHome} className="text-lg sm:text-xl font-black tracking-tighter uppercase">SHOP</button>
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." className="flex-1 px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-sm" />
          <button type="submit" className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest">Tìm</button>
        </form>
        <nav className="ml-auto flex items-center gap-2">
          <Link to="/cart" className="relative px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-100">
            Giỏ hàng
            {totalCard > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center rounded-full">{totalCard}</span>}
          </Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen((o) => !o)} className="px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-100">{user.name}</button>
              {open && (
                <div onMouseLeave={() => setOpen(false)} className="absolute right-0 top-full mt-1 w-48 bg-white border border-black shadow-lg">
                  <Link to="/account" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-neutral-100">Tài khoản</Link>
                  <Link to="/history" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-neutral-100">Đơn hàng</Link>
                  {user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-neutral-100 font-bold">Quản trị</Link>}
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-neutral-100 border-t border-neutral-200">Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-3 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800">Đăng nhập</Link>
          )}
        </nav>
      </div>
    </header>
  );
}