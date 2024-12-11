import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProduct, getProductDetail } from "../../services/productService";
import { Button, Card } from "antd"; // Sử dụng Card từ Ant Design
import { useNavigate } from "react-router-dom";
const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllProduct({ page: 1, limit: 10 }));
  }, []);

  const OnSubmitProduct = (productId) => {
    console.log(productId);
    dispatch(getProductDetail(productId));
  };

  const userProduct = useSelector(
    (state) => state.product.customerProduct.data
  );

  console.log(userProduct);

  return (
    <div className="p-5 bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6"> List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userProduct &&
          userProduct.map((product) => (
            <Card
              key={product.productId}
              hoverable
              className="rounded-lg shadow-md bg-white"
              cover={
                <img
                  onClick={() => navigate(`/product/${product.productId}`)}
                  alt={product.name}
                  src={`data:image/jpeg;base64,${product?.images[0].file.data}`}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              }
            >
              <h2
                className="text-lg font-semibold"
                onClick={() => navigate(`/product/${product.productId}`)}
              >
                {product.name}
              </h2>
              <p className="text-gray-500">${product.price}</p>
              <Button>Thêm vào giỏ hàng</Button>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Home;
