export default function Footer() {
  const infoUrl = import.meta.env.VITE_FOOTER_INFO_URL || "#";
  return (
    <footer className="bg-black text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h5 className="text-2xl font-black tracking-tighter uppercase mb-3">SHOP</h5>
        <div className="flex justify-center gap-6 text-xs uppercase tracking-widest">
          <a href={infoUrl} className="hover:underline">Giới thiệu</a>
          <a href={infoUrl} className="hover:underline">Liên hệ</a>
          <a href={infoUrl} className="hover:underline">Vận chuyển</a>
        </div>
        <p className="mt-6 text-[10px] text-neutral-500 uppercase tracking-widest">© {new Date().getFullYear()} Shop.</p>
      </div>
    </footer>
  );
}