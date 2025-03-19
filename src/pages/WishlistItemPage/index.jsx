import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Button, Card, Input, Modal, Rate, Select, Typography } from "antd";
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusCircleOutlined, ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { deleteWishlist, getAllWishlist, removeFromFavorite, updateWishlist } from "../../services/wishlistService";
import { useDispatch, useSelector } from "react-redux";
import BeeBg from '../../assets/bee-bg.png';
const { Title, Text } = Typography;
import Cookies from "js-cookie";
import './index.css';
import { addProductToCart, getUserCart } from "../../services/cartService";
import { useDrawer } from "../../components/Layout";

const WishlistItemPage = () => {
    const { wishlistId } = useParams();
    const vnMode = useOutletContext();
    const dispatch = useDispatch();
    const [sortOption, setSortOption] = useState("default");
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [wishlistName, setWishlistName] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState("" || null);
    const [bagLoading, setBagLoading] = useState("");
    const token = Cookies.get("token");
    const { toggleDrawer } = useDrawer();
    const navigate = useNavigate();
    const wishlists = useSelector(state => state?.wishlist?.wishlists);
    const getLocalizedText = (text) => {
        if (!text) return "";
        const parts = text.split(" || ");
        return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
    };
    const transformedWishlistData = wishlists?.find(w => w?.wishlistId === wishlistId);
    const wishlistData = useMemo(() => {
        if (!transformedWishlistData) return null;

        return {
            ...transformedWishlistData,
            totalCost: transformedWishlistData.wishlistItems?.reduce((sum, item) => sum + (item.price || 0), 0),
            wishlistItems: transformedWishlistData.wishlistItems?.map(item => ({
                ...item,
                productName: getLocalizedText(item.productName, vnMode),
            })),
        };
    }, [transformedWishlistData, vnMode]);
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
        const sortedAllProducts = sortProducts(products, sortOption);
        if (JSON.stringify(sortedAllProducts) !== JSON.stringify(products)) {
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
        } catch (error) {
            toast.error("Failed to delete wishlist. Please try again.");
        } finally {
            dispatch(getAllWishlist());
            setLoadingDelete(null);
        }
    };

    const handleSortChange = (value) => {
        setSortOption(value);
    };

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
                    toast.error(vnMode ? "Sản phẩm đã hết hàng" : "This product is out of stock");
                    setBagLoading("");
                });
        }
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
            setIsAddModalVisible(false);
            setWishlistName("");
        } catch (error) {
            toast.error("Failed to create wishlist. Please try again.");
        } finally {
            dispatch(getAllWishlist())
            setLoading(false);
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
        } catch {
            toast.error(vnMode ? "Có lỗi khi lọc." : "Failed to filter.");
        } finally {
            setFilterLoading(false);
        }
    };

    const handleAddAllToCart = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        setBagLoading("all");

        try {
            await Promise.all(
                wishlistData?.wishlistItems?.map((item) =>
                    dispatch(addProductToCart({ productId: item.productId, quantity: 1 })).unwrap()
                )
            );

            await dispatch(getUserCart()).unwrap();
            toggleDrawer();
        } catch (error) {
            toast.error(vnMode ? "Một số sản phẩm đã hết hàng!" : "Some products are out of stock!");
        } finally {
            setBagLoading("");
        }
    };

    return (
        <div className="">
            <Card key={wishlistData?.wishlistId} className="p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="sm:flex sm:justify-between sm:items-center sm:w-full">
                    <div className="sm:flex sm:flex-wrap sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-[60%]">
                            <div className="flex items-center space-x-2">
                                <Title level={4} className="!mb-1 text-blue-600 cursor-pointer">
                                    {wishlistData?.name} ({wishlistData?.wishlistItems?.length})
                                </Title>
                                <EditOutlined
                                    onClick={() => setIsAddModalVisible(true)}
                                    className="text-blue-500 cursor-pointer"
                                />
                            </div>
                            <Text className="text-gray-500 text-sm">
                                {vnMode ? "Cập nhật lần cuối:" : "Last updated:"}{" "}
                                {new Date(wishlistData?.createdAt).toLocaleDateString('en-GB')}
                            </Text>
                            <br />
                            <Text strong className="text-sm">
                                {vnMode ? "Tổng chi phí:" : "Total Cost:"}{" "}
                                {wishlistData?.totalCost?.toLocaleString('vi-VN')} VND
                            </Text>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {newestItems?.map((item, index) => (
                                <img
                                    key={index}
                                    src={`data:image/png;base64,${item.productImage.file.data}`}
                                    alt="Product"
                                    className="w-16 h-16 md:w-20 md:h-20 object-cover border border-gray-300 border-solid rounded-lg"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 sm:block flex sm:space-y-5 space-x-3 sm:space-x-0">
                        <Button
                            type="primary"
                            className="bg-orange-300 text-gray-700 border-none flex items-center gap-2 !rounded-full w-full sm:w-auto"
                            disabled={wishlistData?.wishlistItems?.length < 1 || bagLoading === "all"}
                            onClick={handleAddAllToCart}
                            loading={bagLoading === "all"}
                        >
                            <ShoppingOutlined /> {bagLoading === "all" ? (vnMode ? "Đang thêm..." : "Adding...") : (vnMode ? "Thêm tất cả vào giỏ" : "Add all to Cart")}
                        </Button>

                        <Button
                            color="danger"
                            danger
                            variant="solid"
                            className="border-none flex items-center gap-2 justify-center !rounded-full w-full"
                            onClick={() => handleDelete()}
                            loading={loadingDelete === wishlistData?.wishlistId}
                        >
                            <DeleteOutlined /> {vnMode ? "Xóa danh sách" : "Delete Wishlist"}
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
                                <div className="justify-center text-center space-y-2 p-4">
                                    <h1 className="text-orange-500 text-3xl font-bold">
                                        {vnMode ? "Danh sách của bạn hiện đang trống!" : "Your list is currently empty!"}
                                    </h1>
                                    <Button
                                        type="default"
                                        className="bg-blue-600 text-white px-6 py-5 font-bold !rounded-full"
                                        onClick={() => navigate(`/`)}
                                    >
                                        {vnMode ? "Mua sắm ngay" : "Shop Now"}
                                    </Button>
                                </div>
                            </>
                        }>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
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
                                                                toast.error(vnMode ? "Có lỗi khi xoá." : "Failed to delete.");
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
                                                        style={{ width: "100%" }}
                                                        onClick={() => navigate(`/product/${product.productId}`)}
                                                    />
                                                </div>
                                            }
                                            className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                                        >
                                            <div className="h-48 relative">
                                                <h3 className="font-semibold text-base line-clamp-3" onClick={() => navigate(`/product/${product.productId}`)}>{product.productName}</h3>
                                                <div className="flex">
                                                    <Rate allowHalf value={product.avgVoting} className="mb-2 mr-2 text-sm" disabled />
                                                    <p className="text-gray-600">({product.votingQuantity})</p>
                                                </div>
                                                <p className="text-xl font-bold">{formatCurrency(product.price)} vnđ</p>

                                                <Button type="primary" loading={bagLoading === product.productId} onClick={() =>
                                                    handleAddProduct(
                                                        product?.productId,
                                                        1
                                                    )
                                                } icon={<ShoppingCartOutlined />} className="absolute h-10 w-full !rounded-full bottom-0">
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
            <Modal
                title={vnMode ? "Tạo danh sách mới" : "Create new list"}
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
                className="mt-20"
            >
                <div className="flex items-center border border-gray-300 rounded-full p-1 w-full max-w-md">
                    <Input
                        placeholder={vnMode ? "Nhập tên danh sách của bạn" : "Enter your list name"}
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

        </div>
    );
};

export default WishlistItemPage;
