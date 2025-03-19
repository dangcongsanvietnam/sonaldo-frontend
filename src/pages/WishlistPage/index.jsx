import React, { useEffect, useState } from "react";
import { Card, Button, Input, Modal, Typography } from "antd";
import { ArrowRightOutlined, DeleteOutlined, PlusCircleOutlined, PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { addToFavorite, createWishlist, deleteWishlist, getAllWishlist } from "../../services/wishlistService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BeeImage from "../../assets/bee-favorite.jpg";
import './index.css'
import { useNavigate, useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;

const WishlistPage = () => {
    const dispatch = useDispatch();
    const vnMode = useOutletContext();
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [wishlistName, setWishlistName] = useState("");
    const [loading, setLoading] = useState(false);
    const wishlists = useSelector(state => state.wishlist.wishlists);
    const [loadingDelete, setLoadingDelete] = useState("" || null);
    const navigate = useNavigate();

    const sortedWishlists = wishlists?.slice().map(wishlist => ({
        ...wishlist,
        totalCost: wishlist?.wishlistItems?.reduce((sum, item) => sum + (item.price || 0), 0)
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    useEffect(() => {
        dispatch(getAllWishlist());
    }, [dispatch]);

    const handleDelete = async (wishlistId) => {
        setLoadingDelete(wishlistId);
        try {
            await dispatch(deleteWishlist(wishlistId));
            dispatch(getAllWishlist());
        } catch (error) {
            toast.error(vnMode ? "Thất bại khi xoá danh sách yêu thích. Làm ơn thử lại." : "Failed to delete wishlist. Please try again.");
        } finally {
            setLoadingDelete(null);
        }
    };

    const handleCreateWishlist = async () => {
        if (!wishlistName.trim()) {
            toast.warn(vnMode ? "Vui lòng nhập tên danh sách" : "Please enter a wishlist name.");
            return;
        }

        try {
            setLoading(true);
            await dispatch(createWishlist(wishlistName));
            setIsAddModalVisible(false);
            setWishlistName("");
            dispatch(getAllWishlist());
        } catch (error) {
            toast.error(vnMode ? "Thất bại khi tạo danh sách yêu thích. Làm ơn thử lại." : "Failed to create wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="font-bold text-xl md:text-2xl mb-4 md:mb-5">
                {vnMode ? "Danh sách mong muốn" : "Wish list"}
            </div>

            <Card className="p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <img src={BeeImage} className="w-24 md:w-32" alt="Wishlist" />
                        <div>
                            <Title level={4} className="!mb-1 !text-black">
                                {vnMode ? "Mong muốn của bạn là mệnh lệnh của chúng tôi" : "Your wish is our command"}
                            </Title>
                            <Text className="text-gray-600 text-sm md:text-base">
                                {vnMode
                                    ? "Tạo và quản lý danh sách mong muốn cho các dịp khác nhau, theo dõi sản phẩm và dễ dàng tùy chỉnh danh sách của bạn."
                                    : "Create and manage wish lists for different occasions, track products, and customize your lists easily."}
                            </Text>
                        </div>
                    </div>

                    <Button
                        type="default"
                        className="border-[#015AD2] text-black border-2 hover:bg-[#015AD2] hover:text-white px-4 py-3 font-medium !rounded-full w-full md:w-auto"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        {vnMode ? "Tạo danh sách mới" : "Create new list"}
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
                            <div>
                                <div>
                                    <Title level={5} className="!mb-1 text-blue-600 cursor-pointer">
                                        {wishlist.name} ({wishlist?.wishlistItems?.length})
                                    </Title>
                                    <Text className="text-gray-500 text-sm">
                                        {vnMode ? "Cập nhật lần cuối: " : "Last updated: "}
                                        {new Date(wishlist?.createdAt).toLocaleDateString(vnMode ? "vi-VN" : "en-GB")}
                                    </Text>
                                    <br />
                                    <Text strong className="text-sm md:text-base">
                                        {vnMode ? "Tổng chi phí: " : "Total cost: "}
                                        {wishlist.totalCost.toLocaleString("vi-VN")} VND
                                    </Text>
                                </div>

                                <div className="flex gap-2 mt-3 overflow-x-auto">
                                    {newestItems.map((item, index) => (
                                        <img
                                            key={index}
                                            src={`data:image/png;base64,${item.productImage.file.data}`}
                                            alt="Product"
                                            className="w-16 h-16 md:w-20 md:h-20 object-cover border border-gray-300 rounded-lg cursor-pointer"
                                            onClick={() => navigate(`/product/${item.productId}`)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2 mt-4">
                                <Button
                                    type="default"
                                    className="border-2 border-blue-600 text-blue-600 px-4 py-2 !rounded-full w-full md:w-auto"
                                    onClick={() => navigate(`/wishlists/${wishlist.wishlistId}`)}
                                >
                                    {vnMode ? "Xem danh sách" : "View Wishlist"}
                                </Button>

                                <Button
                                    type="primary"
                                    className="bg-orange-300 text-gray-700 border-none flex items-center gap-2 !rounded-full w-full md:w-auto"
                                    disabled={wishlist?.wishlistItems?.length < 1}
                                >
                                    <ShoppingOutlined /> {vnMode ? "Thêm tất cả vào giỏ hàng" : "Add all to Bag"}
                                </Button>

                                <Button
                                    danger
                                    className="border-none flex items-center gap-2 justify-center !rounded-full w-full md:w-auto"
                                    onClick={() => handleDelete(wishlist.wishlistId)}
                                    loading={loadingDelete === wishlist.wishlistId}
                                >
                                    <DeleteOutlined /> {vnMode ? "Xóa danh sách" : "Delete Wishlist"}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
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
        </>
    );
};

export default WishlistPage;
