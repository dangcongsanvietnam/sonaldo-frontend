import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProduct, getHotProducts, getProductsByCategoryItem } from "../../services/productService";
import { Button, Card, Input, Modal, Rate, Tabs, Tag } from "antd";
import { useNavigate, useOutletContext } from "react-router-dom";
import { addProductToCart, getUserCart } from "../../services/cartService";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import './index.css'
import { getRecommendations } from "../../services/userService";
import { ArrowRightOutlined, GiftOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined, SmileOutlined, StarOutlined } from "@ant-design/icons";
import { addToFavorite, createWishlist, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";
import { useDrawer } from "../../components/Layout";
import { getNewestBlogs } from "../../services/feedbackService";
import { getActiveBanner } from "../../services/bannerService";

const Home = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlists = useSelector(state => state.wishlist.wishlists);
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
  const [addLoading, setAddLoading] = useState("" || null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountCategory, setDiscountCategory] = useState(null);
  const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [bagLoading, setBagLoading] = useState("");
  const [isCategoryReady, setIsCategoryReady] = useState(false);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const hotTag = useSelector((state) => state?.search?.data);
  const { toggleDrawer } = useDrawer();
  const { vnMode } = useOutletContext();
  const { activeBanner } = useSelector((state) => state.banner);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };
  const { newestBlogs } = useSelector((state) => state?.feedbacks);

  const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

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
      label: getLocalizedText(activeBanner?.categoryItemName),
      children: renderProductList3(),
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
    if (!isCategoryReady) return null;

    return {
      categories: categoryList?.map((category) => ({
        ...category,
        categoryName: getLocalizedText(category.categoryName),
        description: getLocalizedText(category.description),
        categoryItems: category?.categoryItems.map((categoryItem) => ({
          ...categoryItem,
          name: categoryItem.name,
          categoryName: categoryItem.categoryName
        }))
      })),
    };
  }, [isCategoryReady, categoryList]);

  const interestCategoryItems = useMemo(() => {
    if (!isCategoryReady) return [];

    const interestCategory = categoryList?.find(
      (category) => category.categoryName === "Interests || Sở thích"
    );

    return interestCategory?.categoryItems || [];
  }, [isCategoryReady, categoryList]);

  useEffect(() => {
    if (isCategoryReady && interestCategoryItems.length > 0) {
      Promise.all(
        interestCategoryItems.map((item) =>
          dispatch(getProductsByCategoryItem(item.categoryItemId))
            .unwrap()
            .then((res) => ({
              ...res,
              categoryItemName: getLocalizedText(item.name),
              data: res?.data?.map((product) => ({
                ...product,
                name: getLocalizedText(product.name)
              }))
            })))
      ).then((responses) => {
        const sortedProducts = responses
          .flat()
          .sort((a, b) => b.votingQuantity - a.votingQuantity)
          .slice(0, 10);

        setProductsByCategory(sortedProducts);
      });
    }
  }, [dispatch, isCategoryReady, interestCategoryItems, vnMode]);

  const token = Cookies.get("token");

  useEffect(() => {
    if (categoryList) {
      const foundCategory = categoryList.find(
        (category) => category.categoryName === "Discounts || Khuyến mãi"
      );
      setDiscountCategory(foundCategory || null);
    }
  }, [categoryList, vnMode]);

  useEffect(() => {
    if (categoryList && categoryList.length > 0) {
      setIsCategoryReady(true);
    }
  }, [categoryList]);

  useEffect(() => {
    if (token) {
      dispatch(getAllWishlist());
      dispatch(getUserCart());
      dispatch(getRecommendations())
    }
    dispatch(getAllProduct({ page: 1, limit: 10 }));
    dispatch(getHotProducts({ page: 1, limit: 10 }));
    dispatch(getNewestBlogs(10));
    dispatch(getActiveBanner());
  }, [dispatch]);

  useEffect(() => {
    if (categoryProducts.length === 0 && activeBanner?.categoryItemId) {
      productPromises();
    }
  }, [activeBanner]);

  const productPromises = async () => {
    try {
      const response = await dispatch(getProductsByCategoryItem(activeBanner?.categoryItemId)).unwrap();

      setCategoryProducts(response.data);  // Ensure state updates
    } catch (error) {
    }
  };

  useEffect(() => {
    const productIds = new Set(
      wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
    );
    setWishlistedProducts(productIds);
  }, [wishlists]);

  const handleCancel = () => {
    setIsModalVisible(false);
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
          <div className="w-full overflow-x-auto md:overflow-y-hidden scroll-smooth whitespace-nowrap">
            <div className="flex space-x-6 p-6">
              {recommendations.map((product, index) => {
                const isWishlisted = wishlistedProducts.has(product.productId);

                const discountCategoryItem = product.categoryItems?.find(
                  (item) =>
                    item.categoryName === "Discounts || Khuyến mãi" ||
                    item.categoryName === "Discounts" ||
                    item.categoryName === "Khuyến mãi"
                );

                let discountPercent = 0;
                let discountLabel = "";
                let discountedPrice = product.price;

                if (discountCategoryItem) {
                  discountLabel = discountCategoryItem.name; // e.g. "10%"
                  const match = discountLabel?.match(/(\d+)%/);
                  if (match) {
                    discountPercent = parseInt(match[1]);
                    discountedPrice = product.price - (product.price * discountPercent) / 100;
                  }
                }
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
                        {discountPercent > 0 ? (
                          <div>
                            <p className="text-gray-400 line-through text-sm">
                              {formatCurrency(product.price)} vnđ
                            </p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency(discountedPrice)} vnđ
                            </p>
                            <p className="text-green-600 text-sm font-medium">{discountLabel} OFF</p>
                          </div>
                        ) : (
                          <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>
                        )}

                        <Button
                          type="primary"
                          loading={bagLoading === product.productId}
                          onClick={() => !token ? setIsModalVisible(true) : handleAddProduct(product?.productId, 1)}
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
          <div className="w-full overflow-x-auto md:overflow-y-hidden scroll-smooth whitespace-nowrap">
            <div className="flex space-x-6 p-6">
              {hotProductList.map((product, index) => {
                const isWishlisted = wishlistedProducts.has(product.productId);

                const discountCategoryItem = product.categoryItems?.find(
                  (item) =>
                    item.categoryName === "Discounts || Khuyến mãi" ||
                    item.categoryName === "Discounts" ||
                    item.categoryName === "Khuyến mãi"
                );

                let discountPercent = 0;
                let discountLabel = "";
                let discountedPrice = product.price;

                if (discountCategoryItem) {
                  discountLabel = discountCategoryItem.name; // e.g. "10%"
                  const match = discountLabel?.match(/(\d+)%/);
                  if (match) {
                    discountPercent = parseInt(match[1]);
                    discountedPrice = product.price - (product.price * discountPercent) / 100;
                  }
                }

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

                        {discountPercent > 0 ? (
                          <div>
                            <p className="text-gray-400 line-through text-sm">
                              {formatCurrency(product.price)} vnđ
                            </p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency(discountedPrice)} vnđ
                            </p>
                            <p className="text-green-600 text-sm font-medium">{discountLabel} {vnMode ? "Giảm giá" : "OFF"}</p>
                          </div>
                        ) : (
                          <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>
                        )}

                        <Button
                          type="primary"
                          loading={bagLoading === product.productId}
                          onClick={() => !token ? setIsModalVisible(true) : handleAddProduct(product?.productId, 1)}
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

  function renderProductList3() {
    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

    return (
      <div className="relative w-full h-auto">
        {categoryProducts?.length > 0 ? (
          <div className="w-full overflow-x-auto md:overflow-y-hidden scroll-smooth whitespace-nowrap">
            <div className="flex space-x-6 p-6">
              {categoryProducts.map((product, index) => {
                const isWishlisted = wishlistedProducts.has(product.productId);

                const discountCategoryItem = product.categoryItems?.find(
                  (item) =>
                    item.categoryName === "Discounts || Khuyến mãi" ||
                    item.categoryName === "Discounts" ||
                    item.categoryName === "Khuyến mãi"
                );

                let discountPercent = 0;
                let discountLabel = "";
                let discountedPrice = product.price;

                if (discountCategoryItem) {
                  discountLabel = discountCategoryItem.name; // e.g., "10%"
                  const match = discountLabel?.match(/(\d+)%/);
                  if (match) {
                    discountPercent = parseInt(match[1]);
                    discountedPrice = product.price - (product.price * discountPercent) / 100;
                  }
                }

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
                            src={`data:image/jpeg;base64,${product?.images[0]?.file.data}`}
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
                          {getLocalizedText(product.name)}
                        </h3>
                        <div className="flex">
                          <Rate allowHalf value={product.avgVoting} className="mb-2 mr-2 text-sm" disabled />
                          <p className="text-gray-600">({product.votingQuantity})</p>
                        </div>

                        {discountPercent > 0 ? (
                          <div>
                            <p className="text-gray-400 line-through text-sm">
                              {formatCurrency(product.price)} vnđ
                            </p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency(discountedPrice)} vnđ
                            </p>
                            <p className="text-green-600 text-sm font-medium">{discountLabel} {vnMode ? "Giảm giá" : "OFF"}</p>
                          </div>
                        ) : (
                          <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>
                        )}

                        <Button
                          type="primary"
                          loading={bagLoading === product.productId}
                          onClick={() => !token ? setIsModalVisible(true) : handleAddProduct(product?.productId, 1)}
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
              src={`data:image/jpeg;base64,${activeBanner?.images[0]?.file.data}`}
              alt={activeBanner?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/50 sm:bg-transparent"></div>

          <div className="absolute z-10 flex flex-col sm:right-10 items-center sm:items-end text-white max-w-lg text-center sm:text-right p-4 sm:p-0">
            <h1 className="text-xl sm:text-2xl lg:text-5xl font-bold mt-2">
              {activeBanner?.name}
            </h1>
            <p className="text-xs sm:text-sm lg:text-lg text-gray-400 mt-3">
              {activeBanner?.content}
            </p>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-5">
              <Button
                type="default"
                size="large"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 text-base sm:text-lg"
                onClick={() => navigate(`/category/${activeBanner.categoryId}/${activeBanner.categoryItemId}`)}
              >
                {vnMode ? "Mua sắm bộ sưu tập" : "Shop collection"} →
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
        <div className="bg-gradient-to-r from-yellow-200 to-orange-300">
          <div className="px-4 md:px-6 py-6">
            <div className="font-extrabold text-xl md:text-3xl my-4 text-center text-black">
              {vnMode ? "🐝 Khám phá sản phẩm phù hợp" : "🐝 Find the perfect set"}
            </div>
            <Tabs
              defaultActiveKey="1"
              items={items}
              className="custom-tabs"
              tabBarStyle={{
                borderRadius: "10px",
                padding: "8px",
              }}
            />
          </div>
          <div className="w-full p-6">
            <h2 className="text-3xl font-extrabold mb-6 text-center text-black flex items-center justify-center gap-2">
              🎉 {vnMode ? "Khuyễn mãi đặc biệt" : "Special Discount Deals"} <GiftOutlined className="text-pink-500" />
            </h2>

            {discountCategory && discountCategory.categoryItems.length > 0 ? (
              <div className="w-full overflow-x-auto scroll-smooth whitespace-nowrap flex space-x-6 pb-4 pt-4 items-center justify-center">
                {discountCategory.categoryItems.map((item, index) => (
                  <Card
                    key={index}
                    className="w-56 min-w-[200px] p-4 rounded-2xl shadow-lg bg-gradient-to-br from-pink-300 to-purple-400 text-white text-center border-2 border-yellow-300 transform hover:scale-105 transition duration-300"
                    onClick={() => navigate(`/category/${item.categoryId}/${item.categoryItemId}`)}
                  >
                    <div className="flex flex-col items-center">
                      <StarOutlined className="text-yellow-200 text-3xl mb-2" />
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <SmileOutlined className="text-yellow-100 text-2xl mt-3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-black text-center text-lg mt-4">
                {vnMode ? "Không có sản phẩm khuyến mãi nào" : "No Discount Items Available"} 😢
              </p>
            )}
          </div>
          {productsByCategory?.map((item, index) => {
            return (
              <div className="relative w-full h-auto my-10" key={index}>
                <h2 className="text-3xl font-extrabold mb-6 text-center text-black flex items-center justify-center gap-2">
                  {item.categoryItemName}
                </h2>
                {item.data?.length > 0 && (
                  <div className="w-full overflow-x-auto md:overflow-y-hidden scroll-smooth whitespace-nowrap">
                    <div className="flex space-x-6 p-6">
                      {item.data?.map((product, index) => {
                        const isWishlisted = wishlistedProducts.has(product.productId);

                        const discountCategoryItem = product.categoryItems?.find(
                          (item) =>
                            item.categoryName === "Discounts || Khuyến mãi" ||
                            item.categoryName === "Discounts" ||
                            item.categoryName === "Khuyến mãi"
                        );

                        let discountPercent = 0;
                        let discountLabel = "";
                        let discountedPrice = product.price;

                        if (discountCategoryItem) {
                          discountLabel = discountCategoryItem.name; // e.g., "10%"
                          const match = discountLabel?.match(/(\d+)%/);
                          if (match) {
                            discountPercent = parseInt(match[1]);
                            discountedPrice = product.price - (product.price * discountPercent) / 100;
                          }
                        }
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
                                    src={`data:image/jpeg;base64,${product?.images[0]?.file.data}`}
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
                                {discountPercent > 0 ? (
                                  <div>
                                    <p className="text-gray-400 line-through text-sm">
                                      {formatCurrency(product.price)} vnđ
                                    </p>
                                    <p className="text-xl font-bold text-red-600">
                                      {formatCurrency(discountedPrice)} vnđ
                                    </p>
                                    <p className="text-green-600 text-sm font-medium">{discountLabel} {vnMode ? "Giảm giá" : "OFF"}</p>
                                  </div>
                                ) : (
                                  <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>
                                )}

                                <Button
                                  type="primary"
                                  loading={bagLoading === product.productId}
                                  onClick={() => !token ? setIsModalVisible(true) : handleAddProduct(product?.productId, 1)}
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
                )}
              </div>
            )
          })}
          <div className="mx-auto px-6 py-8">

            <section>
              <h2 className="text-3xl font-bold text-black mb-10 text-center">{vnMode ? "Bài đăng mới nhất" : "Newest Blogs"}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newestBlogs?.slice(0, 3).map((blog) => (
                  <div
                    key={blog.blogId}
                    className="bg-white rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105 text-center"
                  >
                    <img
                      src={`data:image/jpeg;base64,${blog.image.file.data}`}
                      alt={blog.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <h3 className="text-xl font-semibold mt-3 text-gray-800">{blog.subject}</h3>
                    <button
                      className="mt-3 bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-lg"
                      onClick={() => navigate(`/blog/${blog.blogId}`)}
                    >
                      {vnMode ? "Xem thêm" : "Read More"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
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
          title={vnMode ? "Đăng nhập vào tài khoản LEGO® của bạn" : "Sign In to your LEGO® Account"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
          zIndex={10000}
        >
          <div className="text-center">
            <Button
              onClick={() => navigate("/login")}
              className="w-full border-blue-500 text-lg rounded-lg"
            >
              {vnMode ? "Đăng nhập" : "Sign In"}
            </Button>
            <p className="mt-4">
              {vnMode ? "Bạn chưa có tài khoản?" : "Don't have an account?"}{" "}
              <a href="/register" className="text-blue-500">
                {vnMode ? "Đăng ký" : "Register"}
              </a>
            </p>
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
