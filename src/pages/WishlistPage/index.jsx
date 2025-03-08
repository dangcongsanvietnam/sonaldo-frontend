import React, { useEffect, useState } from "react";
import { Card, Button, Input, Modal, Typography, Rate } from "antd";
import { ArrowRightOutlined, DeleteOutlined, HeartFilled, HeartOutlined, LeftOutlined, PlusCircleOutlined, PlusOutlined, RightOutlined, ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { addToFavorite, createWishlist, deleteWishlist, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BeeImage from "../../assets/bee-favorite.jpg";
import './index.css'
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const { Title, Text } = Typography;

const WishlistPage = () => {
    const dispatch = useDispatch();
    const vnMode = true;
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [wishlistName, setWishlistName] = useState("");
    const [loading, setLoading] = useState(false);
    const wishlists = useSelector(state => state.wishlist.wishlists);
    const [loadingDelete, setLoadingDelete] = useState("" || null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [addLoading, setAddLoading] = useState("" || null);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
    const itemsPerPage = 3;
    const navigate = useNavigate();
    const getLocalizedText = (text) => {
        if (!text) return "";
        const parts = text.split(" || ");
        return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
    };
    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);
    const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
    const [selectedProduct, setSelectedProduct] = useState(null);

    const sortedWishlists = wishlists?.slice().map(wishlist => ({
        ...wishlist,
        totalCost: wishlist?.wishlistItems?.reduce((sum, item) => sum + (item.price || 0), 0)
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    useEffect(() => {
        dispatch(getAllWishlist());
    }, [dispatch]);

    useEffect(() => {
        const productIds = new Set(
            wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
        );
        setWishlistedProducts(productIds);
    }, [wishlists]);

    const handleDelete = async (wishlistId) => {
        setLoadingDelete(wishlistId);
        try {
            await dispatch(deleteWishlist(wishlistId));
            toast.success("Wishlist deleted successfully!");
            dispatch(getAllWishlist());
        } catch (error) {
            toast.error("Failed to delete wishlist. Please try again.");
        } finally {
            setLoadingDelete(null);
        }
    };

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

    const handleCreateWishlist = async () => {
        if (!wishlistName.trim()) {
            toast.warn("Please enter a wishlist name.");
            return;
        }

        try {
            setLoading(true);
            await dispatch(createWishlist(wishlistName));
            toast.success("Wishlist created successfully!");
            setIsAddModalVisible(false);
            setWishlistName("");
            dispatch(getAllWishlist());
        } catch (error) {
            toast.error("Failed to create wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
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

    return (
        <>
            <div className="font-bold text-2xl mb-5">Wish list</div>
            <Card className="flex items-center justify-between p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <img src={BeeImage} width={120} alt="Wishlist" />
                    <div>
                        <Title level={3} className="!mb-1 !text-black">
                            Your wish is our command
                        </Title>
                        <Text className="text-gray-600">
                            Create a new wish list or manage your current lists here. You can add or remove
                            products, name the lists to make it easier to track, and even create and save
                            separate wish lists for different occasions or events.
                        </Text>
                    </div>
                    <Button
                        type="default"
                        className="border-[#015AD2] text-black border-2 hover:bg-[#015AD2] hover:text-white px-4 py-4 font-medium !rounded-full"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        Create new list
                    </Button>
                </div>
            </Card>
            <div className="space-y-4 mt-4">
                {sortedWishlists?.map((wishlist) => {
                    const newestItems = wishlist?.wishlistItems
                        ?.slice()
                        .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
                        .slice(0, 3);

                    return (
                        <Card key={wishlist.wishlistId} className="p-4 rounded-2xl shadow-sm border border-gray-200">
                            <div className="wishlist-container">
                                <div className="flex">
                                    <div>
                                        <Title level={4} className="!mb-1 text-blue-600 cursor-pointer">
                                            {wishlist.name} ({wishlist?.wishlistItems?.length})
                                        </Title>
                                        <Text className="text-gray-500">
                                            Last updated: {new Date(wishlist?.createdAt).toLocaleDateString('en-GB')}
                                        </Text>
                                        <br />
                                        <Text strong>
                                            Tổng chi phí: {wishlist.totalCost.toLocaleString('vi-VN')} VND
                                        </Text>
                                    </div>
                                    <div className="flex gap-2 mt-4 ml-20">
                                        {newestItems.map((item, index) => (
                                            <img
                                                key={index}
                                                src={`data:image/png;base64,${item.productImage.file.data}`}
                                                alt="Product"
                                                className="w-20 h-20 object-cover border border-gray-300 border-solid rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 mt-4">
                                    <Button
                                        type="default"
                                        className="border-2 border-blue-600 text-blue-600 px-4 py-2 !rounded-full"
                                        onClick={() =>
                                            navigate(`/wishlists/${wishlist.wishlistId}`)
                                        }
                                    >
                                        View Wishlist
                                    </Button>
                                    <Button type="primary" className="bg-orange-300 text-gray-700 border-none flex items-center gap-2 !rounded-full" disabled={wishlist?.wishlistItems?.length < 1}>
                                        <ShoppingOutlined /> Add all to Bag
                                    </Button>
                                    <Button
                                        color="danger"
                                        danger
                                        variant="solid"
                                        className="border-none flex items-center gap-2 justify-center !rounded-full"
                                        onClick={() => handleDelete(wishlist.wishlistId)}
                                        loading={loadingDelete === wishlist.wishlistId}
                                    >
                                        <DeleteOutlined /> Delete Wishlist
                                    </Button>

                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <div className="font-bold pt-14 pl-6 text-4xl">Recommended For You</div>
            <div className="relative my-5 w-full h-auto overflow-hidden">
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
                                        <div key={index} className="px-6 py-6 shrink-0 w-1/3" style={{ height: 600 }}>
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

            <Modal
                title="Create new list"
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
                className="mt-20"
            >
                <div className="flex items-center border border-gray-300 rounded-full p-1 w-full max-w-md">
                    <Input
                        placeholder="Enter your list name"
                        value={wishlistName}
                        onChange={(e) => setWishlistName(e.target.value)}
                        className="flex-1 border-none outline-none bg-transparent px-3"
                        style={{ borderRadius: "999px", border: "none", boxShadow: "none" }}
                    />
                    <Button
                        type="primary"
                        shape="circle"
                        icon={!loading && <PlusCircleOutlined />}
                        onClick={handleCreateWishlist}
                        loading={loading}
                        className="!flex !items-center !justify-center !rounded-full"
                        style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    />
                </div>
            </Modal>
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
        </>
    );
};

export default WishlistPage;
