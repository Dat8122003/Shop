import { useContext, useEffect } from "react";
import { CardContext } from "../context/CardContext";
import Cancel from "../components/Cancel";
export default function Cart() {
  const {
    card,
    priceCard,
    totalPrice,
    handleCheckOut,
    removeCard,
    products,
    selectItem,
    setSelectItem,
    plusMinus,
    Select,
  } = useContext(CardContext);

  // Cập nhật thẻ được chọn mỗi khi thêm giỏ hàng
  useEffect(() => setSelectItem(card.map((i) => i.p_id)), [card]);
  return (
    <>
      <Cancel url="/" />
      <div className="h3 mt-2 text-center fw-bold mb-2">GIỎ HÀNG</div>
      <div className="container pb-5">
        <div
          className={`${
            card.length === 0 ? "" : "border p-4r-md p-3 border-dark rounded"
          }`}
        >
          {card.length === 0 ? (
            <p className="text-center">Giỏ hàng của bạn trống</p>
          ) : (
            card.map((cartItem) => {
              const product = products.find((p) => p.p_id === cartItem.p_id);
              if (!product) return null;
              return (
                <div
                  className="mb-2 row align-items-center justify-content-center"
                  key={cartItem.p_id}
                >
                  <div className="col-12 col-md-4 d-flex justify-content-center align-items-center gap-5 mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      style={{ transform: "scale(1.5)" }}
                      checked={selectItem.includes(cartItem.p_id)}
                      onChange={() =>
                        setSelectItem((item) =>
                          item.includes(cartItem.p_id)
                            ? item.filter((id) => id !== cartItem.p_id)
                            : [...item, cartItem.p_id]
                        )
                      }
                    />
                    <div className="mb-2">
                      <img
                        className="w-75"
                        src={product.p_img}
                        alt={product.p_name}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <p>Tên sản phẩm</p>
                    <p className="fw-bold">{product.p_name}</p>{" "}
                  </div>
                  <div className="col-md-2">
                    <p>
                      Giá trị:{" "}
                      <span className="text-danger fw-bold">
                        {priceCard(cartItem.p_id).toLocaleString()}đ
                      </span>
                    </p>
                  </div>
                  <div className="col-12 col-md-3 d-flex justify-content-center gap-3 pb-3 border-b">
                    <div className="btn-group">
                      <button
                        onClick={() => plusMinus(false, cartItem.p_id)}
                        className="btn btn-dark"
                      >
                        -
                      </button>
                      <button className="btn">
                        <span className="text-danger fw-bold">
                          {cartItem.quantity}
                        </span>
                      </button>
                      <button
                        onClick={() => plusMinus(true, cartItem.p_id)}
                        className="btn btn-dark"
                      >
                        +
                      </button>
                    </div>
                    <div className="">
                      <button
                        onClick={() => removeCard(cartItem.p_id)}
                        className="btn btn-dark"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {card.length === 0 || (
        <div className="bg-light fixed-bottom d-flex justify-content-end align-items-center gap-3 p-1">
          <p className="mb-0">
            Tổng giá:{" "}
            <span className="text-danger fw-bold">
              {totalPrice(Select).toLocaleString()}đ
            </span>
          </p>
          <button
            className="btn btn-danger"
            onClick={() => handleCheckOut(Select)}
          >
            Thanh Toán
          </button>
        </div>
      )}
    </>
  );
}
