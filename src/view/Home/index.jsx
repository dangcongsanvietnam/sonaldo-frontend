import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProduct, getHotProducts } from "../../services/productService";
import { Button, Card, Input, Modal, Rate, Tabs, Tag } from "antd";
import { useNavigate, useOutletContext } from "react-router-dom";
import { addProductToCart, getUserCart } from "../../services/cartService";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import './index.css'
import { getRecommendations } from "../../services/userService";
import { ArrowRightOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { addToFavorite, createWishlist, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";
import { useDrawer } from "../../components/Layout";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlists = useSelector(state => state.wishlist.wishlists);
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
  const [addLoading, setAddLoading] = useState("" || null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [bagLoading, setBagLoading] = useState("");
  const hotTag = useSelector((state) => state?.search?.data);
  const { toggleDrawer } = useDrawer();
  const { vnMode } = useOutletContext();
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
      label: vnMode ? "Phổ biến" : 'Popular',
      children: renderProductList2(),
    },
    {
      key: '3',
      label: vnMode ? "Đề xuất cho bạn" : 'Personal',
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

  useEffect(() => {
    if (token) {
      dispatch(getAllWishlist());
      dispatch(getUserCart());
      dispatch(getRecommendations())
    }
    dispatch(getAllProduct({ page: 1, limit: 10 }));
    dispatch(getHotProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    const productIds = new Set(
      wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
    );
    setWishlistedProducts(productIds);
  }, [wishlists]);

  const addToFavourite = (product) => {
    const token = Cookies.get("token");
    setSelectedProduct(product);

    if (!token) {
      setIsLoginModalVisible(true);
      return;
    }

    let foundWishlist = null;
    let foundWishlistItem = null;

    if (wishlists.length === 0) {
      dispatch(createWishlist("Favorite"))
        .unwrap()
        .then((newWishlist) => {
          const data = {
            productId: product.productId,
            wishlistId: newWishlist.wishlistId
          };
          return dispatch(addToFavorite(data)).unwrap();
        })
        .then(() => {
          setWishlistedProducts((prev) => new Set(prev).add(product.productId));
        })
        .catch(() => {
          toast.error(vnMode ? "Thêm vào yêu thích thất bại!" : "Failed to add!");
        })
        .finally(() => dispatch(getAllWishlist()));
      return;
    }

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
    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

    return (
      <div className="relative w-full h-auto">
        {recommendations?.length > 0 ? (
          <div className="w-full overflow-x-auto scroll-smooth whitespace-nowrap">
            <div className="flex space-x-6">
              {recommendations.map((product, index) => {
                const isWishlisted = wishlistedProducts.has(product.productId);
                return (
                  <div key={index} className="shrink-0 w-[250px]">
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
                            onClick={() => navigate(`/product/${product.productId}`)}
                          />
                        </div>
                      }
                      className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                    >
                      <div className="h-48 relative">
                        <h3
                          className="font-semibold text-base line-clamp-3"
                          onClick={() => navigate(`/product/${product.productId}`)}
                        >
                          {product.name}
                        </h3>
                        <div className="flex">
                          <Rate allowHalf value={product.avgVoting} className="mb-2 mr-2 text-sm" disabled />
                          <p className="text-gray-600">({product.votingQuantity})</p>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>

                        <Button
                          type="primary"
                          loading={bagLoading === product.productId}
                          onClick={() => handleAddProduct(product?.productId, 1)}
                          icon={<ShoppingCartOutlined />}
                          className="absolute h-10 w-full !rounded-full bottom-0"
                        >
                          {vnMode ? 'Thêm vào giỏ hàng' : 'Add to Cart'}
                        </Button>
                      </div>
                    </Card>
                  </div>
                );
              })}
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
    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

    return (
      <div className="relative w-full h-auto">
        {hotProductList?.length > 0 ? (
          <div className="w-full overflow-x-auto scroll-smooth whitespace-nowrap">
            <div className="flex space-x-6 p-6">
              {hotProductList.map((product, index) => {
                const isWishlisted = wishlistedProducts.has(product.productId);
                return (
                  <div key={index} className="shrink-0 w-[250px]">
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
                            onClick={() => navigate(`/product/${product.productId}`)}
                          />
                        </div>
                      }
                      className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                    >
                      <div className="h-48 relative">
                        <h3
                          className="font-semibold text-base line-clamp-3"
                          onClick={() => navigate(`/product/${product.productId}`)}
                        >
                          {product.name}
                        </h3>
                        <div className="flex">
                          <Rate allowHalf value={product.avgVoting} className="mb-2 mr-2 text-sm" disabled />
                          <p className="text-gray-600">({product.votingQuantity})</p>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>

                        <Button
                          type="primary"
                          loading={bagLoading === product.productId}
                          onClick={() => handleAddProduct(product?.productId, 1)}
                          icon={<ShoppingCartOutlined />}
                          className="absolute h-10 w-full !rounded-full bottom-0"
                        >
                          {vnMode ? 'Thêm vào giỏ hàng' : 'Add to Cart'}
                        </Button>
                      </div>
                    </Card>
                  </div>
                );
              })}
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

  const handleAddProduct = (productId, quantitySelected) => {
    setBagLoading(productId);
    if (!token) {
      navigate("/login");
    } else {
      dispatch(addProductToCart({ productId, quantity: quantitySelected }))
        .unwrap()
        .then(() => {
          dispatch(getUserCart())
            .unwrap()
            .then(() => {
              toggleDrawer();
              setBagLoading("");
            });
        }).catch(() => {
          toast.error(vnMode ? "Thêm sản phẩm thất bại!" : "Failed to add!");
          setBagLoading("");
        });
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] bg-black flex items-center justify-center p-5 sm:p-10">
          <div className="absolute inset-0">
            <img
              src="https://www.lego.com/cdn/cs/set/assets/bltfc4613ebd350e8da/1996-2025-Homepage-Hero-Standard-42207-Large.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5"
              alt="Lego F1 Car"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/50 sm:bg-transparent"></div>

          <div className="absolute z-10 flex flex-col sm:right-10 items-center sm:items-end text-white max-w-lg text-center sm:text-right p-4 sm:p-0">
            <h2 className="text-sm sm:text-lg uppercase tracking-wide text-gray-300">
              TECHNIC
            </h2>
            <h1 className="text-xl sm:text-2xl lg:text-5xl font-bold mt-2">
              Race like a champion
            </h1>
            <p className="text-xs sm:text-sm lg:text-lg text-gray-400 mt-3">
              Build and display new LEGO® F1® sets like the Ferrari SF-24 F1 Car.
            </p>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-5">
              <Button
                type="default"
                size="large"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 text-base sm:text-lg border-gray-400 text-white"
              >
                Shop all new →
              </Button>
              <Button
                type="default"
                size="large"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 text-base sm:text-lg"
              >
                Shop collection →
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto whitespace-nowrap py-4 bg-[#E4E5EC]">
          <div className="flex gap-4 md:justify-center">
            {categories?.categories?.map((category, index) => (
              <div key={index} className="flex flex-col items-center w-[120px] sm:w-[160px] flex-shrink-0">
                <div
                  key={category.name}
                  className="w-[120px] sm:w-[160px] h-[120px] sm:h-[160px] text-center p-4 rounded-lg cursor-pointer hover:opacity-80 text-white font-bold text-lg flex items-center justify-center"
                >
                  <img
                    onClick={() => navigate(`/brand/${brandId}/${category.brandCategoryId}`)}
                    src={`data:image/jpeg;base64,${category.imageFile.file.data}`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-in-out hover:scale-110 rounded-xl"
                  />
                </div>
                <div className="font-semibold text-xs truncate w-[120px] sm:w-[160px] text-center mt-2">
                  {category.categoryName}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="font-bold text-xl md:text-3xl my-10 md:my-20 text-center">
          {vnMode ? "Khám phá sản phẩm phù hợp" : "Find the perfect set"}
        </div>
        <div className="px-4 md:px-6">
          <Tabs defaultActiveKey="1" items={items} className="custom-tabs" />
        </div>
        <div className="p-5 mx-5 border bg-white rounded-lg">
          <div className="font-bold text-lg mb-5">{vnMode ? "Tag Nổi Bật" : "Hot Tags"}</div>
          <div className="flex flex-wrap gap-2">
            {hotTag?.map((tag) => (
              <Tag key={tag.tagId} color="gold" className="text-sm px-3 py-1">
                #{tag.tagName}
              </Tag>
            ))}
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
