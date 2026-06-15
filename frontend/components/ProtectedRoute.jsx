import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function ProtectedRoute({ children, guest, adminOnly }) {
  const { user, loading } = useContext(CartContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!guest && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
