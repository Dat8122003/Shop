import { useContext } from "react";
import { CardContext } from "../context/CardContext";
export default function ProtectedRoute({ children }) {
  const { loading } = useContext(CardContext);
  if (loading)
    return (
      <div className="text-center mt-5">
        <p>Đang tải...</p>
      </div>
    );
  return children;
}
