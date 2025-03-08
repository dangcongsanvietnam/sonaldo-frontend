import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Modal, Rate, Progress, Carousel, Image, InputNumber, Input, Select } from "antd";
import { ArrowRightOutlined, HeartFilled, HeartOutlined, LeftOutlined, RightOutlined, ShoppingCartOutlined, StarFilled } from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import { getProductDetail, getRecommendProducts } from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useLoading } from "../../provider/LoadingProvider";
import { addToFavorite, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";
import { toast } from "react-toastify";
import { addProductToCart, getUserCart } from "../../services/cartService";
import { useDrawer } from "../../components/Layout";
import { addReview, getAllReview } from "../../services/reviewService";
import ImageUpload from "../../components/ImageUpload";
import { getRecommendations } from "../../services/userService";

const PublicProductDetail = () => {
  const { startLoading, stopLoading } = useLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const token = Cookies.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
  const carouselRef = useRef(null);
  const vnMode = true;
  const { id } = useParams();
  const [quantitySelected, setQuantitySelected] = useState(1);
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };
  const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);
  const publicProductDetail = useSelector(
    (state) => state.product?.product?.data
  );
  const [state, setState] = useState(publicProductDetail?.state);
  const wishlists = useSelector(state => state.wishlist.wishlists);
  const reviews = useSelector(state => state.reviews?.reviews);
  const isWishlisted = wishlistedProducts.has(id);
  const [addLoading, setAddLoading] = useState("" || null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [bagLoading, setBagLoading] = useState(false);
  const [currentIndex3, setCurrentIndex3] = useState(0);
  const [fileList, setFileList] = useState([]);
  const { toggleDrawer } = useDrawer();
  const [content, setContent] = useState("");
  const [voting, setVoting] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const userSuggestions = useSelector((state) => {
    return state.product.recommend;
  })
  const recommended = userSuggestions.map((item) => {
    return {
      ...item,
      name: getLocalizedText(item.name),
      description: getLocalizedText(item.description)
    }
  })
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
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const itemsPerPage = 5;
  const { averageRating, totalReviews, ratingCounts } = useMemo(() => {
    if (!reviews.length) return { averageRating: 0, totalReviews: 0, ratingCounts: {} };

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.voting, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    const ratingCounts = reviews.reduce((acc, review) => {
      acc[review.voting] = (acc[review.voting] || 0) + 1;
      return acc;
    }, {});

    return { averageRating, totalReviews, ratingCounts };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest") return b.voting - a.voting;
      if (sortBy === "lowest") return a.voting - b.voting;
      return 0;
    });
  }, [reviews, sortBy]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    return sortedReviews.slice(startIndex, startIndex + reviewsPerPage);
  }, [sortedReviews, currentPage]);

  useEffect(() => {
    const productIds = new Set(
      wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
    );
    setWishlistedProducts(productIds);
  }, [wishlists]);

  useEffect(() => {
    dispatch(getAllWishlist());
    dispatch(getAllReview(id));
    dispatch(getRecommendProducts(id));
    dispatch(getRecommendations())
  }, [dispatch]);

  console.log(recommendations)

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };
  const productImages = publicProductDetail?.images;

  const nextSlide = () => {
    if (currentIndex2 + itemsPerPage < recommended.length) {
      setCurrentIndex2(currentIndex2 + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex2(currentIndex2 - 1);
    }
  };

  const nextSlide2 = () => {
    if (currentIndex3 + itemsPerPage < recommendations.length) {
      setCurrentIndex3(currentIndex3 + 1);
    }
  };

  const prevSlide2 = () => {
    if (currentIndex3 > 0) {
      setCurrentIndex3(currentIndex3 - 1);
    }
  };

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
    setBagLoading(true);
    if (!token) {
      navigate("/login");
    } else {
      dispatch(addProductToCart({ productId, quantity: quantitySelected }))
        .unwrap()
        .then(() => {
          dispatch(getUserCart())
            .unwrap()
            .then(() => {
              toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
              toggleDrawer();
              setBagLoading(false);
            });
        }).catch(() => {
          toast.error("Thêm sản phẩm thất bại!");
          setBagLoading(false);
        });
    }
  };

  const handleSubmit = () => {
    const updateValues = {
      content: content,
      voting: voting,
      files: fileList.map((file) => file?.originFileObj),
    };

    handleSubmitReview(updateValues);
  };

  const handleSubmitReview = (updateValues) => {
    dispatch(addReview({ updateValues, productId: id }))
      .unwrap()
      .then(() => {
        dispatch(getAllReview(id));
        setIsModalVisible(false);
      })
      .catch((error) => {
        console.error("Error submitting review:", error);
      });
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

  const handleAddReview = () => {
    setIsReviewModalVisible(true);
  };

  const truncateText = (text, limit) => {
    if (text.length > limit) {
      return text.substring(0, limit) + "...";
    }
    return text;
  };

  return (
    <div className="container mx-auto">
      <div className="flex border-b border-t border-l mt-4">
        <div className="col-span-9 border-b h-[500px]">
          <div className="flex flex-col">
            <div className="flex">
              <Sider className="gap-2 py-4 justify-items-center space-y-2 overflow-x-auto bg-[#F2F2F2] !w-auto !min-w-unset !max-w-unset">
                <div className="space-y-2">
                  {productImages?.map((img, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer bg-white justify-items-center overflow-hidden border ${currentIndex === index ? "border-blue-500" : ""
                        }`}
                      onClick={() => {
                        setCurrentIndex(index);
                        carouselRef.current?.goTo(index);
                      }}
                      style={{
                        width: 150
                      }}
                    >
                      <div>
                        <img src={`data:image/jpeg;base64,${img?.file?.data}`} className="rounded-md object-contain" style={{
                          width: 100,
                          height: 100
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Sider>
              <div className="relative w-[620px] h-[500px] overflow-hidden">
                <Carousel
                  ref={carouselRef}
                  afterChange={(index) => setCurrentIndex(index)}
                  dots={false}
                  className=""
                >
                  {productImages?.map((img, index) => (
                    <div key={index} className="flex">
                      <img src={`data:image/jpeg;base64,${img?.file?.data}`} className="rounded-lg object-contain" style={{
                        width: 620,
                      }} />
                    </div>
                  ))}
                </Carousel>

                <span className="absolute top-2 left-2 bg-gray-700 text-white px-2 py-1 rounded">
                  {currentIndex + 1}/{productImages?.length}
                </span>

                <Button
                  type="primary"
                  className="absolute top-2 right-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  View All
                </Button>

                <Button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={handlePrev}
                  icon={<LeftOutlined />}
                />
                <Button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={handleNext}
                  icon={<RightOutlined />}
                />
              </div>
            </div>

            <Modal
              title="Product Images"
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              width={800}
              zIndex={9999}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productImages?.map((img, index) => (
                  <Image key={index} src={img} width={200} height={200} style={{
                    zIndex: '10000'
                  }} />
                ))}
              </div>
            </Modal>
          </div>
        </div>

        <div className="col-span-3 border-l border-r px-2 py-6 w-[460px]">
          <h1 className="text-3xl font-bold">{getLocalizedText(publicProductDetail?.name)}</h1>
          <p className="text-xl text-black mt-5">{formatCurrency(publicProductDetail?.price)} vnđ</p>
          <p className="text-green-600 font-semibold">{state}</p>

          <div className="mt-6 flex items-center space-x-4">
            <InputNumber
              min={1}
              max={publicProductDetail?.quantity}
              value={quantitySelected}
              onChange={setQuantitySelected}
              style={{ width: "80px" }}
            />
            <Button loading={bagLoading} onClick={() =>
              handleAddProduct(
                publicProductDetail?.productId,
                quantitySelected
              )
            } type="primary" icon={<ShoppingCartOutlined />} className="bg-orange-500 hover:bg-orange-600">
              Add to Bag
            </Button>
            <div
              className="bg-white rounded-full p-2 shadow-md cursor-pointer z-10"
              style={{ width: "35px", height: "35px" }}
              onClick={() => addToFavourite(publicProductDetail)}
            >
              {isWishlisted ? (
                <HeartFilled className="text-red-500 text-xl" />
              ) : (
                <HeartOutlined className="text-red-500 text-xl" />
              )}
            </div>
          </div>
          <hr className="my-4" />

          <div className="font-bold">{getLocalizedText(publicProductDetail?.description)}</div>
        </div>
      </div>

      <div className="col-span-12 mt-12">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Rate allowHalf defaultValue={publicProductDetail?.avgVoting} disabled />
            <p className="text-gray-500">
              ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
            </p>
          </div>
          <Button type="primary">Write a Review</Button>
        </div>

        {/* 📊 Rating Breakdown */}
        <div className="grid grid-cols-2 mt-4">
          <div>
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2">
                <p className="w-10">{star} ★</p>
                <Progress percent={(ratingCounts[star] || 0) / totalReviews * 100} showInfo={false} className="w-64" />
                <p className="text-gray-500">{ratingCounts[star] || 0} Reviews</p>
              </div>
            ))}
          </div>

          {/* 🔽 Sorting Dropdown */}
          <div className="flex justify-end">
            <Select value={sortBy} onChange={setSortBy} style={{ width: 150 }}>
              <Select.Option value="newest">Newest First</Select.Option>
              <Select.Option value="highest">Highest Rating</Select.Option>
              <Select.Option value="lowest">Lowest Rating</Select.Option>
            </Select>
          </div>
        </div>

        {/* 📝 Reviews List */}
        <div className="my-6 space-y-6">
          {totalReviews > 0 ? (
            paginatedReviews.map((review, index) => (
              <Card key={index}>
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold">{review.email}</h3>
                  <Rate allowHalf defaultValue={review.voting} disabled />
                </div>
                <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                <p className="mt-2">
                  {truncateText(review.content, 100)}
                  {review.content.length > 100 && (
                    <Button type="link">Read more</Button>
                  )}
                </p>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 p-6">
              <p className="text-xl font-semibold">No reviews yet</p>
              <p>Be the first to write a review!</p>
              <Button type="primary" className="mt-2">Write a Review</Button>
            </div>
          )}
        </div>

        {/* 📃 Pagination */}
        {totalReviews > reviewsPerPage && (
          <Pagination
            current={currentPage}
            pageSize={reviewsPerPage}
            total={totalReviews}
            onChange={setCurrentPage}
            className="text-center"
          />
        )}
      </div>
      <div className="font-bold text-2xl mb-5">Maybe You Like</div>
      <div className="relative w-full h-auto overflow-hidden">
        {recommended?.length > 0 ? (
          <div className="flex items-center">
            <button onClick={prevSlide} disabled={currentIndex2 === 0}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <LeftOutlined />
            </button>
            <button onClick={nextSlide} disabled={currentIndex2 + itemsPerPage >= recommended.length}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <RightOutlined />
            </button>
            <div className="w-full overflow-hidden">
              <div className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentIndex2 * (100 / itemsPerPage)}%)` }}>
                {recommended.map((product, index) => {
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
      <div className="font-bold text-2xl mb-5">Suggestion Just For You</div>
      <div className="relative w-full h-auto overflow-hidden">
        {recommendations?.length > 0 ? (
          <div className="flex items-center">
            <button onClick={prevSlide2} disabled={currentIndex3 === 0}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <LeftOutlined />
            </button>
            <button onClick={nextSlide2} disabled={currentIndex3 + itemsPerPage >= recommended.length}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-3 shadow-md rounded-full z-10">
              <RightOutlined />
            </button>
            <div className="w-full overflow-hidden">
              <div className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentIndex3 * (100 / itemsPerPage)}%)` }}>
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
      <Modal
        title="Hey! Save your amazing wish list"
        open={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        footer={null}
        zIndex={10000}
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
        zIndex={10000}
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
      <Modal
        title="Write a Review"
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        onOk={handleSubmit}
        okText="Submit"
        zIndex={10000}
      >
        <Input.TextArea
          rows={4}
          placeholder="Write your review..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Rate value={voting} onChange={setVoting} className="mt-2" />

        <ImageUpload fileList={fileList} setFileList={setFileList} />
      </Modal>
    </div>
  );
};

export default PublicProductDetail;
