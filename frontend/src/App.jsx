import Home from "../pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "../components/Navbar";
import { Routes, Route } from "react-router-dom";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Account from "../pages/Acount";
import History from "../pages/History";
import CheckOut from "../pages/CheckOut";
import ProtectedRoute from "../components/ProtectedRoute";
import Admin from "../pages/Admin";
import Footer from "../components/Footer";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ProtectedRoute>
                <Navbar />
                <Home />
                <Footer />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Navbar />
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Navbar />
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Navbar />
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Navbar />
              <CheckOut />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Navbar />
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
