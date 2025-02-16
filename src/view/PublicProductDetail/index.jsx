import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getProductDetail } from "../../services/productService";
import { Button, Carousel, Spin } from "antd";
import "./index.css";
import { addProductToCart, getUserCart } from "../../services/cartService";
import Cookies from "js-cookie";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoading } from "../../provider/LoadingProvider";

const PublicProductDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const { startLoading, stopLoading, isLoading } = useLoading();

  useEffect(() => {
    startLoading();
    dispatch(getProductDetail(id))
      .unwrap()
      .then(() => {
        stopLoading();
      })
      .catch(() => {
        stopLoading();
      });
  }, [dispatch, id, startLoading, stopLoading]);

  const publicProductDetail = useSelector(
    (state) => state.product?.product?.data
  );

  const [quantitySelected, setQuantitySelected] = useState(1);
  const [state, setState] = useState(publicProductDetail?.state);

  const allImage = publicProductDetail?.images;

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

  useEffect(() => {
    if (quantitySelected >= publicProductDetail?.quantity) {
      setState("Hết hàng");
    } else if (quantitySelected <= 0) {
      setState("Hết hàng");
    } else {
      setState("Còn hàng");
    }
  }, [quantitySelected, publicProductDetail?.quantity]);

  const handleAddProduct = (productId, quantitySelected) => {
    console.log("qty", quantitySelected);
    if (!token) {
      navigate("/login");
    } else {
      dispatch(addProductToCart({ productId, quantity: quantitySelected }))
        .unwrap()
        .then(() => {
          dispatch(getUserCart())
            .unwrap()
            .then((res) => {
              toast.success("Sản phẩm đã được thêm vào giỏ hàng!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
            });
        })
        .catch((error) => {
          toast.error("Thêm sản phẩm thất bại!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        });
    }
  };

  return (
    <>
      <ToastContainer />

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex justify-between">
          <div className="w-2/3">
            <Carousel arrows autoplaySpeed={2000}>
              {allImage?.map((image, index) => (
                <div style={{ height: "300px", width: "100%" }} key={index}>
                  <img
                    style={{ objectFit: "contain" }}
                    src={`data:image/jpeg;base64,${image?.file?.data}`}
                    alt={`Slide ${index}`}
                  />
                </div>
              ))}
            </Carousel>
          </div>
          <div className="w-1/3 p-10 flex flex-col gap-5">
            <div className="font-bold text-3xl">
              {publicProductDetail?.name}
            </div>
            <div className="font-bold text-3xl">
              {publicProductDetail?.price}
            </div>
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
            <div className="flex justify-between ">
              <button
                className="rounded-none bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 w-1/2 shadow-md transition-all duration-300"
                disabled={quantitySelected <= 0 || state === "Out of Stock"}
                onClick={() =>
                  handleAddProduct(
                    publicProductDetail.productId,
                    quantitySelected
                  )
                }
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="rounded-none bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 w-1/2 shadow-md transition-all duration-300"
                disabled={quantitySelected <= 0 || state === "Out of Stock"}
                onClick={() => navigate("/orders")}
              >
                Mua hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicProductDetail;
