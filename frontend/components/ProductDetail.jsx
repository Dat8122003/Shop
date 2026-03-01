import { useParams } from "react-router-dom";
import { useContext, useLayoutEffect } from "react";
import Cancel from "./Cancel";
import { CardContext } from "../context/CardContext";
export default function ProductDetail() {
  const { products, addCard, handleCheckOut } = useContext(CardContext);
  const { id } = useParams();
  const product = products.find((p) => p.p_id === id);
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Cancel url="/" />
      <div className="container-fluid mt-md">
        <div className="row">
          <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center border-end-md">
            <img
              className="img-detail border-md p-3"
              src={product.p_img}
              alt="img"
            />
            <div className="d-flex gap-4">
              <p className="text-primary fw-bold">Kho: {product.p_stock}</p>
              <p className="text-danger fw-bold">
                Giá:{" "}
                <span>
                  {" "}
                  {!product.p_discountPrice
                    ? product.p_price.toLocaleString()
                    : product.p_discountPrice.toLocaleString()}
                  đ
                </span>
              </p>
            </div>
            <div className="d-flex justify-content-center">
              {product.p_stock ? (
                <div className="mb-3 d-flex gap-4">
                  <button
                    onClick={() => {
                      handleCheckOut([{ ...product, quantity: 1 }]);
                    }}
                    className="btn btn-dark p-2"
                  >
                    Mua ngay
                  </button>
                  <button
                    onClick={() => addCard(product.p_id)}
                    className="btn btn-light border border-dark p-2"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              ) : (
                <button className="btn btn-light border border-dark p-2 mb-2">
                  Hết hàng
                </button>
              )}
            </div>
          </div>
          <div className="col-12 col-md-5">
            <h3>{product.p_name}</h3>
            <p style={{ textAlign: "justify" }}>{product.p_description}</p>
          </div>
        </div>
      </div>
    </>
  );
}
