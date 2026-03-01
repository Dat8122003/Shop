import Productcard from "../components/ProductCard";
import { useContext } from "react";
import { CardContext } from "../context/CardContext";
export default function Home() {
  const { selectCategory, products } = useContext(CardContext);
  const filterProducts = selectCategory
    ? products.filter((item) => item.p_category === selectCategory)
    : products;
  return (
    <>
      <div className="container p-3 justify-centent-between">
        <h2 className="text-center fw-bold">DANH SÁCH SẢN PHẨM</h2>
        <div className="row">
          {filterProducts.length === 0 ? (
            <div className="text-center">Không tìm thấy sản phẩm tương tự</div>
          ) : (
            filterProducts.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 mt-3" key={item.p_id}>
                <Productcard product={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
