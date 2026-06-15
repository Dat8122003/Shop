import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Account from "../pages/Account";
import Admin from "../pages/Admin";
import Cart from "../pages/Cart";
import CheckOut from "../pages/CheckOut";
import History from "../pages/History";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProductDetail from "../pages/ProductDetail";

const Shell = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white text-black">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const Page = ({ guest, adminOnly, children }) => (
  <ProtectedRoute guest={guest} adminOnly={adminOnly}>
    <Shell>{children}</Shell>
  </ProtectedRoute>
);

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Page guest><Home /></Page>} />
        <Route path="/products/:id" element={<Page guest><ProductDetail /></Page>} />
        <Route path="/cart" element={<Page guest><Cart /></Page>} />
        <Route path="/checkout" element={<Page guest><CheckOut /></Page>} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Page><Account /></Page>} />
        <Route path="/history" element={<Page><History /></Page>} />
        <Route path="/admin" element={<Page adminOnly><Admin /></Page>} />
      </Routes>
    </>
  );
}
