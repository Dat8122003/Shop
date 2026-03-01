import { useNavigate } from "react-router-dom";
export default function Cancel({ url }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="container-fluid">
        <button
          className="btn btn-light border border-dark"
          onClick={() => {
            navigate(`${url}`);
          }}
        >
          Quay lại
        </button>
      </div>
    </>
  );
}
