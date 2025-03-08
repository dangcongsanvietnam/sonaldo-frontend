import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProduct, getHotProducts, getProductDetail } from "../../services/productService";
import { Button, Card, Input, Modal, Rate, Tabs, Tag } from "antd"; // Sử dụng Card từ Ant Design
import { useNavigate, useOutletContext } from "react-router-dom";
import { addProductToCart, getUserCart } from "../../services/cartService";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import './index.css'
import { getRecommendations } from "../../services/userService";
import { ArrowRightOutlined, HeartFilled, HeartOutlined, LeftOutlined, RightOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { addToFavorite, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setCart = useOutletContext();
  const wishlists = useSelector(state => state.wishlist.wishlists);
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
  const [addLoading, setAddLoading] = useState("" || null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const hotTag = useSelector((state) => state?.search?.data);
  const itemsPerPage = 5;
  const vnMode = true;
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };

  const suggestions = useSelector((state) => {
    return state.user.suggestions;
  })
  const recommendations = suggestions.map((item) => {
    return {
      ...item,
      name: getLocalizedText(item.name),
      description: getLocalizedText(item.description)
    }
  })

  const hotProducts = useSelector((state) => {
    return state.product?.hotProducts
  });
  const hotProductList = hotProducts.map((item) => {
    return {
      ...item,
      name: getLocalizedText(item.name),
      description: getLocalizedText(item.description)
    }
  })

  const items = [
    {
      key: '1',
      label: 'F1® Cars',
      children: renderProductList2(),
    },
    {
      key: '2',
      label: 'Popular',
      children: renderProductList2(),
    },
    {
      key: '3',
      label: 'Personal',
      children: renderProductList(),
    },
  ];

  const categoryList = useSelector((state) => state.category?.categories?.data);
  const categories = useMemo(() => {
    if (!categoryList) return null;

    return {
      categories: categoryList?.map((category) => ({
        ...category,
        categoryName: getLocalizedText(category.categoryName),
        description: getLocalizedText(category.description),
        categoryItems: category?.categoryItems.map((categoryItem) => ({
          name: categoryItem.name,
          categoryName: categoryItem.categoryName
        }))
      })),
    };
  }, [categoryList]);

  const token = Cookies.get("token");

  const userCart = useSelector((state) => state.cart?.userCart);

  useEffect(() => {
    dispatch(getAllWishlist());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(getRecommendations())
    }
  }, [dispatch]);

  useEffect(() => {
    const productIds = new Set(
      wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
    );
    setWishlistedProducts(productIds);
  }, [wishlists]);

  useEffect(() => {
    dispatch(getAllProduct({ page: 1, limit: 10 }));
    dispatch(getHotProducts({ page: 1, limit: 10 }));
    dispatch(getUserCart());
  }, [dispatch]);

  const OnSubmitProduct = (productId) => {
    if (!token) {
      navigate("/login");
    } else {
      dispatch(addProductToCart({ productId, quantity: 1 }))
        .unwrap()
        .then(() => {
          dispatch(getUserCart())
            .unwrap()
            .then((res) => {
              console.log("res home", res.data);
              setCart(res.data);
              toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
            });
        });
    }
  };

  const onChange = (key) => {
    console.log(key);
  };

  const addToFavourite = (product) => {
    const token = Cookies.get("token");
    setSelectedProduct(product);

    if (!token) {
      setIsLoginModalVisible(true);
      return;
    }

    let foundWishlist = null;
    let foundWishlistItem = null;

    for (const wishlist of wishlists) {
      for (const wishlistItem of wishlist.wishlistItems) {
        if (wishlistItem.productId === product.productId) {
          foundWishlist = wishlist;
          foundWishlistItem = wishlistItem;
          break;
        }
      }
      if (foundWishlist && foundWishlistItem) break;
    }

    if (foundWishlist && foundWishlistItem) {
      dispatch(removeFromFavorite({
        wishlistId: foundWishlist.wishlistId,
        wishlistItemId: foundWishlistItem.wishlistItemId,
        productId: product.productId
      }))
        .unwrap()
        .then(() => {
          setWishlistedProducts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(product.productId);
            return newSet;
          });
          toast.success(vnMode ? "Đã xóa khỏi danh sách yêu thích!" : "Removed from favorites!");
        })
        .catch(() => {
          toast.error(vnMode ? "Xóa khỏi danh sách yêu thích thất bại!" : "Failed to remove!");
        })
        .finally(() => dispatch(getAllWishlist()));
    } else {
      if (wishlists.length === 1) {
        const data = {
          productId: product.productId,
          wishlistId: wishlists[0].wishlistId
        };
        dispatch(addToFavorite(data))
          .unwrap()
          .then(() => {
            setWishlistedProducts((prev) => new Set(prev).add(product.productId));
            toast.success(vnMode ? "Thêm vào yêu thích thành công!" : "Added to favorites!");
          })
          .catch(() => {
            toast.error(vnMode ? "Thêm vào yêu thích thất bại!" : "Failed to add!");
          })
          .finally(() => dispatch(getAllWishlist()));
      } else if (wishlists.length > 1) {
        setIsWishlistModalVisible(true);
      }
    }
  };

  const handleSelectWishlist = (wishlistId) => {
    const data = {
      productId: selectedProduct.productId,
      wishlistId: wishlistId
    };
    setAddLoading(wishlistId);

    dispatch(addToFavorite(data))
      .unwrap()
      .then(() => {
        setWishlistedProducts((prev) => new Set(prev).add(selectedProduct.productId));
        toast.success(vnMode ? "Thêm vào yêu thích thành công!" : "Added to favorites!");
      })
      .catch(() => {
        toast.error(vnMode ? "Thêm vào yêu thích thất bại!" : "Failed to add!");
      })
      .finally(() => {
        dispatch(getAllWishlist());
        setIsWishlistModalVisible(false);
        setAddLoading("");
      });
  };


  function renderProductList() {
    const nextSlide = () => {
      if (currentIndex + itemsPerPage < recommendations.length) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    const prevSlide = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };

    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);


    return (
      <div className="relative w-full h-auto overflow-hidden">
        {recommendations?.length > 0 ? (
          <div className="flex items-center">
            <button onClick={prevSlide} disabled={currentIndex === 0}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <LeftOutlined />
            </button>
            <button onClick={nextSlide} disabled={currentIndex + itemsPerPage >= recommendations.length}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <RightOutlined />
            </button>
            <div className="w-full overflow-hidden">
              <div className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}>
                {recommendations.map((product, index) => {
                  const isWishlisted = wishlistedProducts.has(product.productId);
                  return (
                    <div key={index} className="px-6 py-6 shrink-0 w-1/4" style={{ height: 600 }}>
                      <Card
                        cover={
                          <div className="relative">
                            <div
                              className="bg-white absolute top-4 right-4 rounded-full p-2 shadow-md cursor-pointer z-10"
                              style={{ width: "35px", height: "35px" }}
                              onClick={() => addToFavourite(product)}
                            >
                              {isWishlisted ? (
                                <HeartFilled className="text-red-500 text-xl" />
                              ) : (
                                <HeartOutlined className="text-red-500 text-xl" />
                              )}
                            </div>
                            <img
                              src={`data:image/jpeg;base64,${product?.imageUrl?.file.data}`}
                              className="h-[250px] w-full object-cover rounded-t-lg"
                              style={{ width: "100%" }}
                            />
                          </div>
                        }
                        className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                      >
                        <div className="h-48 relative">
                          <h3 className="font-semibold text-base line-clamp-3">{product.name}</h3>
                          <div className="flex">
                            <Rate allowHalf value={product.avgVoting} className="mb-2 mr-2 text-sm" disabled />
                            <p className="text-gray-600">({product.votingQuantity})</p>
                          </div>
                          <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>

                          <Button type="primary" icon={<ShoppingCartOutlined />} className="absolute h-10 w-full !rounded-full bottom-0">
                            {vnMode ? 'Thêm vào giỏ hàng' : 'Add to Cart'}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-4 text-center py-10 text-gray-500">
            <p>{vnMode ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn." : "No products found matching your filters."}</p>
          </div>
        )}
      </div>
    );
  }

  function renderProductList2() {
    const nextSlide = () => {
      if (currentIndex2 + itemsPerPage < hotProductList.length) {
        setCurrentIndex2(currentIndex2 + 1);
      }
    };

    const prevSlide = () => {
      if (currentIndex > 0) {
        setCurrentIndex2(currentIndex2 - 1);
      }
    };

    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

    return (
      <div className="relative w-full h-auto overflow-hidden">
        {hotProductList?.length > 0 ? (
          <div className="flex items-center">
            <button onClick={prevSlide} disabled={currentIndex2 === 0}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <LeftOutlined />
            </button>
            <button onClick={nextSlide} disabled={currentIndex2 + itemsPerPage >= hotProductList.length}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <RightOutlined />
            </button>
            <div className="w-full overflow-hidden">
              <div className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentIndex2 * (100 / itemsPerPage)}%)` }}>
                {hotProductList.map((product, index) => {
                  const isWishlisted = wishlistedProducts.has(product.productId);
                  return (
                    <div key={index} className="px-6 py-6 shrink-0 w-1/4" style={{ height: 600 }}>
                      <Card
                        cover={
                          <div className="relative">
                            <div
                              className="bg-white absolute top-4 right-4 rounded-full p-2 shadow-md cursor-pointer z-10"
                              style={{ width: "35px", height: "35px" }}
                              onClick={() => addToFavourite(product)}
                            >
                              {isWishlisted ? (
                                <HeartFilled className="text-red-500 text-xl" />
                              ) : (
                                <HeartOutlined className="text-red-500 text-xl" />
                              )}
                            </div>
                            <img
                              src={`data:image/jpeg;base64,${product?.imageUrl?.file.data}`}
                              className="h-[250px] w-full object-cover rounded-t-lg"
                              style={{ width: "100%" }}
                            />
                          </div>
                        }
                        className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
                        onClick={() => navigate(`/product/${product.productId}`)}
                      >
                        <div className="h-48 relative">
                          <h3 className="font-semibold text-base line-clamp-3">{product.name}</h3>
                          <div className="flex">
                            <Rate allowHalf value={product.avgVoting} className="mb-2 mr-2 text-sm" disabled />
                            <p className="text-gray-600">({product.votingQuantity})</p>
                          </div>
                          <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>

                          <Button type="primary" icon={<ShoppingCartOutlined />} className="absolute h-10 w-full !rounded-full bottom-0">
                            {vnMode ? 'Thêm vào giỏ hàng' : 'Add to Cart'}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-4 text-center py-10 text-gray-500">
            <p>{vnMode ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn." : "No products found matching your filters."}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <div className="relative w-full h-[350px] lg:h-[400px] bg-black flex items-center justify-between p-10">
          <div className="absolute inset-0">
            <img
              src="https://www.lego.com/cdn/cs/set/assets/bltfc4613ebd350e8da/1996-2025-Homepage-Hero-Standard-42207-Large.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5"
              alt="Lego F1 Car"
              className="w-full h-full"
            />
          </div>

          <div className="absolute right-10 z-10 flex flex-col items-end text-white max-w-xl">
            <h2 className="text-lg lg:text-2xl uppercase tracking-wide text-gray-300">
              TECHNIC
            </h2>
            <h1 className="text-2xl lg:text-5xl font-bold mt-2">
              Race like a champion
            </h1>
            <p className="text-sm lg:text-lg text-gray-400 mt-3">
              Build and display new LEGO® F1® sets like the Ferrari SF-24 F1 Car.
            </p>

            {/* Buttons */}
            <div className="flex space-x-4 mt-5">
              <Button
                type="default"
                size="large"
                className="px-6 py-2 text-lg border-gray-400 text-white"
              >
                Shop all new →
              </Button>
              <Button type="default" size="large" className="px-6 py-2 text-lg">
                Shop collection →
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-4 pb-8 bg-[#E4E5EC]">
          {categories?.categories?.map((category, index) => (
            <div key={index} className="text-center" style={{
              width: '160px'
            }}>
              <div key={category.name} className={`text-center p-4 rounded-lg cursor-pointer hover:opacity-80 text-white font-bold text-lg flex items-center justify-center`} style={{ width: 160, height: 160 }}>
                <img onClick={() => navigate(`/brand/${brandId}/${category.brandCategoryId}`)} src={`data:image/jpeg;base64,${category.imageFile.file.data}`} className="w-full max-h-full object-contain transition-transform duration-300 ease-in-out hover:scale-110 rounded-xl" />
              </div>
              <div className="font-semibold text-xs truncate overflow-hidden whitespace-nowrap" style={{
                width: '160px'
              }}>
                {category.categoryName}
              </div>
            </div>
          ))}
        </div>
        <div className="font-bold text-3xl my-20 text-center">Find the perfect set</div>
        <div className="px-6">
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} className="custom-tabs" />
        </div>
        <div className="p-5 mx-5 border bg-white rounded-lg">
          <div className="font-bold text-lg mb-5">Hot Tags</div>
          <div className="flex">
            {hotTag?.map((tag) => {
              return (
                <div key={tag.tagId}>
                  <Tag color="gold">#{tag.tagName}</Tag>
                </div>
              );
            })}
          </div>
        </div>
        <Modal
          title="Hey! Save your amazing wish list"
          open={isLoginModalVisible}
          onCancel={() => setIsLoginModalVisible(false)}
          footer={null}
        >
          <p className="mb-5">Enter your email address below and we will save this product to your wish list or &nbsp;
            <span onClick={() => navigate("/login")} className="underline text-blue-600 text-base">Log in</span></p>
          <div className="flex items-center border border-gray-300 rounded-full p-1 w-full max-w-md">
            <Input
              type="email"
              placeholder="Enter your email"
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent px-3"
              style={{ borderRadius: "999px", border: "none", boxShadow: "none" }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<ArrowRightOutlined />}
              // onClick={handleSubmit}
              className="flex items-center justify-center !rounded-full"
              style={{ width: "32px", height: "32px", minWidth: "32px" }}
            />
          </div>
        </Modal>
        <Modal
          title={vnMode ? "Chọn danh sách yêu thích" : "Choose Wishlist"}
          open={isWishlistModalVisible}
          onCancel={() => setIsWishlistModalVisible(false)}
          footer={null}
        >
          <div>
            {wishlists.map((wishlist) => (
              <Button
                key={wishlist.wishlistId}
                onClick={() => handleSelectWishlist(wishlist.wishlistId)}
                style={{ width: "100%", marginBottom: "10px" }}
                loading={addLoading === wishlist.wishlistId}
              >
                {wishlist.name || "Wishlist " + wishlist.wishlistId}
              </Button>
            ))}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Home;
