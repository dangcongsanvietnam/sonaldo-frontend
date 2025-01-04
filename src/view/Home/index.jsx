// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getAllProduct, getProductDetail } from "../../services/productService";
// import { Button, Card } from "antd"; // Sử dụng Card từ Ant Design
// import { useNavigate } from "react-router-dom";
// const Home = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     dispatch(getAllProduct({ page: 1, limit: 10 }));
//   }, []);

//   const OnSubmitProduct = (productId) => {
//     console.log(productId);
//     dispatch(getProductDetail(productId));
//   };

//   const userProduct = useSelector(
//     (state) => state?.product?.customerProduct?.data
//   );

//   console.log(userProduct);

//   return (
//     <div className="p-5 bg-gray-100">
//       <h1 className="text-2xl font-bold text-center mb-6"> List</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {userProduct &&
//           userProduct?.map((product) => (
//             <Card
//               key={product?.productId}
//               hoverable
//               className="rounded-lg shadow-md bg-white"
//               cover={
//                 <img
//                   onClick={() => navigate(`/product/${product.productId}`)}
//                   alt={product?.name}
//                   src={`data:image/jpeg;base64,${product?.imageFile?.file.data}`}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                     borderRadius: "8px",
//                   }}
//                 />
//               }
//             >
//               <h2
//                 className="text-lg font-semibold"
//                 onClick={() => navigate(`/product/${product.productId}`)}
//               >
//                 {product.name}
//               </h2>
//               <p className="text-gray-500">${product.price}</p>
//               <Button className="w-full" type="primary">
//                 Thêm vào giỏ hàng
//               </Button>
//             </Card>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProduct, getProductDetail } from "../../services/productService";
import { Button, Card } from "antd"; // Sử dụng Card từ Ant Design
import { useNavigate } from "react-router-dom";
import { addProductToCart } from "../../services/cartService";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userProduct = useSelector(
    (state) => state?.product?.customerProduct?.data
  );

  useEffect(() => {
    dispatch(getAllProduct({ page: 1, limit: 10 }));
  }, [dispatch]);

  const OnSubmitProduct = (productId) => {
    console.log("productId", productId);
    dispatch(addProductToCart({ productId, quantity: 1 })).then((res) =>
      console.log(res)
    );
  };

  console.log(userProduct);

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Product List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-start">
        {userProduct &&
          userProduct.map((product) => (
            <Card
              key={product?.productId}
              hoverable
              className="rounded-lg shadow-md bg-white transition-transform duration-300 hover:scale-105"
              cover={
                <img
                  onClick={() => navigate(`/product/${product.productId}`)}
                  alt={product?.name}
                  src={`data:image/jpeg;base64,${product?.imageUrl?.file?.data}`}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                />
              }
            >
              <div className="flex flex-col gap-2">
                <h2
                  className="text-lg font-semibold cursor-pointer"
                  onClick={() => navigate(`/product/${product.productId}`)}
                >
                  {product.name}
                </h2>
                <p className="text-gray-500">${product.price}</p>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  type="primary"
                  disabled={product.stockStatus === "In Stock" ? false : true}
                  onClick={() => OnSubmitProduct(product.productId)}
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Home;
