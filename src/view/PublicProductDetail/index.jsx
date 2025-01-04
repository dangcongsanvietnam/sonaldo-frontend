import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getProductDetail } from "../../services/productService";
import { Button, Carousel } from "antd";
import "./index.css";

const PublicProductDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getProductDetail(id));
  }, [dispatch, id]);

  const publicProductDetail = useSelector(
    (state) => state.product?.product?.data
  );

  console.log("publicProductDetail", publicProductDetail);

  // Fake data to test (can be replaced with real API data)
  // const fakeData = {
  //   product: {
  //     data: {
  //       name: "Sample Product",
  //       price: "$199.99",
  //       description: "This is a sample product description.",
  //       quantity: 10,
  //       state: "In Stock",
  //       images: [
  //         {
  //           file: { data: "https://via.placeholder.com/300x200?text=Image+1" },
  //         },
  //         {
  //           file: { data: "https://via.placeholder.com/300x200?text=Image+2" },
  //         },
  //         {
  //           file: { data: "https://via.placeholder.com/300x200?text=Image+3" },
  //         },
  //         {
  //           file: { data: "https://via.placeholder.com/300x200?text=Image+4" },
  //         },
  //       ],
  //     },
  //   },
  // };

  const [quantitySelected, setQuantitySelected] = useState(1); // Initial quantity selected
  const [state, setState] = useState(publicProductDetail?.state); // Track the product state

  // const publicProductDetail = fakeData.product.data;
  const allImage = publicProductDetail?.images;
  console.log(allImage);

  const handleIncrease = () => {
    if (quantitySelected < publicProductDetail?.quantity) {
      setQuantitySelected(quantitySelected + 1);
    }
  };

  const handleDecrease = () => {
    if (quantitySelected > 1) {
      setQuantitySelected(quantitySelected - 1);
    }
  };

  const contentStyle = {
    margin: 0,
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    display: "flex", // Dùng flexbox để căn giữa nội dung
    justifyContent: "center", // Căn giữa theo chiều ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    overflow: "hidden", // Ẩn các phần nội dung bị tràn ra ngoài
    // maxWidth: "100%", // Đảm bảo hình ảnh không vượt quá chiều rộng của container
    // maxHeight: "100%", // Đảm bảo hình ảnh không vượt quá chiều cao của container
    objectFit: "cover", // Đảm bảo hình ảnh được cắt vừa khung mà không bị méo
  };

  // Update the state when quantity reaches 0 or product is out of stock
  useEffect(() => {
    if (quantitySelected >= publicProductDetail?.quantity) {
      setState("Hết hàng");
    } else if (quantitySelected <= 0) {
      setState("Hết hàng");
    } else {
      setState("Còn hàng");
    }
  }, [quantitySelected, publicProductDetail?.quantity]);

  return (
    <>
      <div className="flex justify-between">
        <div className="w-2/3">
          <Carousel arrows autoplaySpeed={2000}>
            {allImage?.map((image, index) => (
              <div
                style={{
                  height: "300px",
                  width: "100%",
                }}
                key={index}
              >
                <img
                  // style={contentStyle}
                  style={{ objectFit: "contain" }}
                  src={`data:image/jpeg;base64,${image?.file?.data}`}
                  alt={`Slide ${index}`}
                />
              </div>
            ))}
          </Carousel>
        </div>
        <div className="w-1/3 p-10 flex flex-col gap-5">
          <div className="font-bold text-3xl">{publicProductDetail?.name}</div>
          <div className="font-bold text-3xl">{publicProductDetail?.price}</div>

          {/* Quantity Selection */}
          <div className="flex items-center space-x-4">
            <button
              className="bg-gray-300 rounded-full p-2"
              onClick={handleDecrease}
              disabled={quantitySelected <= 1}
            >
              -
            </button>
            <span className="text-xl">{quantitySelected}</span>
            <button
              className="bg-gray-300 rounded-full p-2"
              onClick={handleIncrease}
              disabled={quantitySelected >= publicProductDetail?.quantity}
            >
              +
            </button>
          </div>

          <div className="mt-2">Trạng thái sản phẩm : {state}</div>
          <div>Số lượng : {publicProductDetail?.quantity}</div>
          <div>{publicProductDetail?.description}</div>

          {/* Button */}
          <div>
            <button
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 w-full shadow-md transition-all duration-300"
              disabled={quantitySelected <= 0 || state === "Out of Stock"}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProductDetail;
