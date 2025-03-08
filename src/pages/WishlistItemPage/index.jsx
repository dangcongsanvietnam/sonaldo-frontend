import { useParams } from "react-router-dom";
import { Button, Card, Input, Modal, Rate, Select, Typography } from "antd";
import { ArrowRightOutlined, DeleteOutlined, EditOutlined, HeartFilled, HeartOutlined, LeftOutlined, LoadingOutlined, PlusCircleOutlined, RightOutlined, ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { addToFavorite, deleteWishlist, getAllWishlist, removeFromFavorite, updateWishlist } from "../../services/wishlistService";
import { useDispatch, useSelector } from "react-redux";
import BeeBg from '../../assets/bee-bg.png';
const { Title, Text } = Typography;
import Cookies from "js-cookie";
import './index.css';

const WishlistItemPage = () => {
    const { wishlistId } = useParams();
    const vnMode = true;
    const dispatch = useDispatch();
    const [sortOption, setSortOption] = useState("default");
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [wishlistName, setWishlistName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState("" || null);
    const [addLoading, setAddLoading] = useState("" || null);
    const wishlists = useSelector(state => state?.wishlist?.wishlists);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const getLocalizedText = (text) => {
        if (!text) return "";
        const parts = text.split(" || ");
        return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
    };
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 3;
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
    const transformedWishlistData = wishlists?.find(w => w?.wishlistId === wishlistId);
    const wishlistData = transformedWishlistData
        ? {
            ...transformedWishlistData,
            wishlistItems: transformedWishlistData.wishlistItems?.map(item => ({
                ...item,
                productName: getLocalizedText(item.productName),
            })),
        }
        : null;
    const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
    const [products, setProducts] = useState([]);
    const newestItems = wishlistData?.wishlistItems
        ?.slice()
        .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
        .slice(0, 3);

    useEffect(() => {
        dispatch(getAllWishlist());
    }, [dispatch]);

    useEffect(() => {
        if (products.length < 1) {
            if (wishlistData?.wishlistItems && JSON.stringify(wishlistData.wishlistItems) !== JSON.stringify(products)) {
                setProducts(wishlistData.wishlistItems);
            }
        }
    }, [wishlistData, products]);

    useEffect(() => {
        const productIds = new Set(
            wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
        );
        setWishlistedProducts(productIds);
    }, [wishlists]);

    useEffect(() => {
        const sortedAllProducts = sortProducts(products, sortOption);
        console.log(1111, sortedAllProducts)
        if (JSON.stringify(sortedAllProducts) !== JSON.stringify(products)) {
            console.log(1223)
            setProducts(sortedAllProducts);
        }
    }, [sortOption]);

    const sortOptions = [
        { value: "default", label: <span>{vnMode ? "Sắp xếp" : "Sort By"}</span> },
        { value: "price-low-high", label: <span>{vnMode ? "Giá: Thấp đến cao" : "Price: Low to High"}</span> },
        { value: "price-high-low", label: <span>{vnMode ? "Giá: Cao đến thấp" : "Price: High to Low"}</span> },
        { value: "name-asc", label: <span>A-Z</span> },
        { value: "name-dsc", label: <span>Z-A</span> },
        { value: "rating-high-low", label: <span>{vnMode ? "Đánh giá cao nhất" : "Best Rated"}</span> },
        { value: "rating-low-high", label: <span>{vnMode ? "Đánh giá thấp nhất" : "Worst Rated"}</span> },
    ];

    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

    const handleDelete = async () => {
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

    const handleSortChange = (value) => {
        setSortOption(value);
    };

    const handleUpdateWishlist = async () => {
        if (!wishlistName.trim()) {
            toast.warn("Please enter a wishlist name.");
            return;
        }

        try {
            const data = {
                wishlistId: wishlistId,
                name: wishlistName
            }
            setLoading(true);
            await dispatch(updateWishlist(data));
            toast.success("Wishlist created successfully!");
            setIsAddModalVisible(false);
            setWishlistName("");
            dispatch(getAllWishlist())
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

    const sortProducts = (products, sortOption) => {
        setFilterLoading(true)
        try {
            if (!products || products.length === 0) return [];

            switch (sortOption) {
                case "price-low-high":
                    return [...products].sort((a, b) => a.price - b.price);

                case "price-high-low":
                    return [...products].sort((a, b) => b.price - a.price);

                case "name-asc":
                    return [...products].sort((a, b) => a.productName.localeCompare(b.productName));

                case "name-dsc":
                    return [...products].sort((a, b) => b.productName.localeCompare(a.productName));

                case "rating-high-low":
                    return [...products].sort((a, b) => (b.avgVoting || 0) - (a.avgVoting || 0));

                case "rating-low-high":
                    return [...products].sort((a, b) => (a.avgVoting || 0) - (b.avgVoting || 0));

                case "default":
                    return products;
                default:
                    return products;
            }
        } catch (error) {
            toast.error(getLocalizedText("Failed to filter. || Có lỗi khi lọc."));
        } finally {
            setFilterLoading(false);
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
        <div>
            <Card key={wishlistData?.wishlistId} className="p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="wishlist-container">
                    <div className="flex">
                        <div>
                            <div className="flex space-x-2">
                                <Title level={4} className="!mb-1 text-blue-600 cursor-pointer">
                                    {wishlistData?.name} ({wishlistData?.wishlistItems?.length})
                                </Title>
                                <EditOutlined onClick={() => setIsAddModalVisible(true)} className="text-blue-500 cursor-pointer" />
                            </div>
                            <Text className="text-gray-500">
                                Last updated: {new Date(wishlistData?.createdAt).toLocaleDateString('en-GB')}
                            </Text>
                            <br />
                            <Text strong>
                                Tổng chi phí: {wishlistData?.totalCost?.toLocaleString('vi-VN')} VND
                            </Text>
                        </div>
                        <div className="flex gap-2 mt-4 ml-20">
                            {newestItems?.map((item, index) => (
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
                        <Button type="primary" className="bg-orange-300 text-gray-700 border-none flex items-center gap-2 !rounded-full" disabled={wishlistData?.wishlistItems?.length < 1}>
                            <ShoppingOutlined /> Add all to Bag
                        </Button>
                        <Button
                            color="danger"
                            danger
                            variant="solid"
                            className="border-none flex items-center gap-2 justify-center !rounded-full"
                            onClick={() => handleDelete()}
                            loading={loadingDelete === wishlistData?.wishlistId}
                        >
                            <DeleteOutlined /> Delete Wishlist
                        </Button>

                    </div>
                </div>
            </Card>
            <div className="flex justify-end my-5">
                <Select options={sortOptions} defaultValue="default" onChange={handleSortChange} className="w-48" />
            </div>
            <div>
                {filterLoading ? (
                    <div className="col-span-4 flex justify-center items-center h-96">
                        <Spin size="large" />
                    </div>
                ) : (
                    wishlistData?.wishlistItems.length < 1 ? (
                        <Card cover={
                            <>
                                <img src={BeeBg} />
                                <div className="justify-center text-center space-y-2">
                                    <h1 className="text-orange-500 text-3xl font-bold">Your list is currently empty!</h1>
                                    <Button
                                        type="default"
                                        className="bg-blue-600 text-white px-6 py-5 font-bold !rounded-full"
                                    // onClick={() =>
                                    //     navigate(`/wishlists/${wishlist.wishlistId}`)
                                    // }
                                    >
                                        Shop Now
                                    </Button>
                                </div>
                            </>
                        }>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {products?.map((product, index) => {
                                return (
                                    <div key={index} className="px-6">
                                        <Card
                                            cover={
                                                <div className="relative">
                                                    <div
                                                        className="bg-white absolute top-4 right-4 rounded-full p-2 shadow-md cursor-pointer z-10"
                                                        style={{ width: "35px", height: "35px" }}
                                                        onClick={() => {
                                                            setLoadingDelete(product.wishlistItemId);
                                                            try {
                                                                dispatch(removeFromFavorite({
                                                                    wishlistId: wishlistId,
                                                                    wishlistItemId: product.wishlistItemId,
                                                                    productId: product.productId
                                                                })).then(() => {
                                                                    dispatch(getAllWishlist());
                                                                    setLoadingDelete("")
                                                                })
                                                            } catch (error) {
                                                                setLoadingDelete("");
                                                                toast.error("Failed to delete wishlist. Please try again.");
                                                            }
                                                        }}
                                                    >
                                                        {loadingDelete === product.wishlistItemId ? (
                                                            <LoadingOutlined className="text-red-500 text-xl" />
                                                        ) : (
                                                            <DeleteOutlined className="text-red-500 text-xl" />
                                                        )}
                                                    </div>
                                                    <img
                                                        src={`data:image/jpeg;base64,${product?.productImage?.file.data}`}
                                                        className="h-[250px] w-full object-cover rounded-t-lg"
                                                    />
                                                </div>
                                            }
                                            className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                                            style={{ width: 300, height: 500 }}
                                        >
                                            <div className="h-48 relative">
                                                <h3 className="font-semibold text-base line-clamp-3">{product.productName}</h3>
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
                    ))
                }
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
                        onClick={handleUpdateWishlist}
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
        </div>
    );
};

export default WishlistItemPage;
