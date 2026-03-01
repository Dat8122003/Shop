import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CardContext } from "../context/CardContext";
export default function Productcard({ product }) {
  const { addCard } = useContext(CardContext);
  const navigate = useNavigate();
  return (
    <>
      <div className="card shadow">
        <div className="position-relative">
          <img className="card-img-top p-1" src={product.p_img} alt="img" />
          <div className="overlay d-flex justify-content-center align-items-center">
            <button
              className="btn btn-dark w-auto"
              onClick={() => navigate(`/products/${product.p_id}`)}
            >
              Chi tiết
            </button>
          </div>
        </div>
        <div className="card-body">
          <h5 className="text-center">{product.p_name}</h5>
          {!product.p_discountPrice ? (
            <p className="text-danger text-center fw-bold">
              {product.p_price.toLocaleString()}đ
            </p>
          ) : (
            <div className="row">
              <p className="col-4 text-muted text-decoration-line-through">
                {product.p_price.toLocaleString()}đ
              </p>
              <p className="col-4 text-danger fw-bold">
                {product.p_discountPrice.toLocaleString()}đ
              </p>
            </div>
          )}
          <div className="card-footer mt-auto">
            {product.p_stock ? (
              <div className="d-grid gap-2 d-md-flex">
                <button
                  className="btn btn-dark w-100 w-md-auto"
                  onClick={() => navigate(`/products/${product.p_id}`)}
                >
                  Mua
                </button>
                <button
                  onClick={() => {
                    addCard(product.p_id);
                  }}
                  className="btn btn-light border-dark w-100 w-md-auto"
                >
                  Thêm giỏ
                </button>
              </div>
            ) : (
              <button className="btn btn-light border border-dark w-100 w-md-auto">
                Hết hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
