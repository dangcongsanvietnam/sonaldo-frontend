import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Checkbox, ConfigProvider, Drawer, InputNumber, Modal, Pagination, Rate, Select, Slider } from "antd";
import { ClearOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Filter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { addProductToCart, getUserCart } from "../../services/cartService";
import { useDrawer } from "../../components/Layout";
import { addToFavorite, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";
import { searchProducts } from "../../services/productService";

const { Option } = Select;
const PRODUCTS_PER_PAGE = 20;

const SearchResult = () => {
    const { vnMode } = useOutletContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("default");
    const [inStockCount, setInStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [bagLoading, setBagLoading] = useState("");
    const { toggleDrawer } = useDrawer();
    const token = Cookies.get("token");
    const [addLoading, setAddLoading] = useState("" || null);
    const navigate = useNavigate();
    const { keyword } = useParams();
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const getLocalizedText = (text) => {
        if (!text) return "";
        const parts = text.split(" || ");
        return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
    };

    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState({
        availability: [],
        priceRange: [0, 10000000],
    });
    const [filterLoading, setFilterLoading] = useState(false);
    const [filterMode, setFilterMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
    const dispatch = useDispatch();
    const wishlists = useSelector(state => state.wishlist.wishlists);
    const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
    const productsData = useSelector(
        (state) => state?.product?.suggestProducts
    );

    const suggestProducts = useMemo(() => {
        if (!productsData) return [];
        return productsData.map((product) => ({
            ...product,
            name: getLocalizedText(product.name),
        }));
    }, [productsData, vnMode]);

    const totalProducts = suggestProducts.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    useEffect(() => {
        const inStock = suggestProducts.filter(product => product.stockStatus === "InStock").length;
        const outOfStock = suggestProducts.filter(product => product.quantity === "OutofStock").length;
        setInStockCount(inStock);
        setOutOfStockCount(outOfStock);
    }, [suggestProducts]);

    useEffect(() => {
        const productIds = new Set(
            wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
        );
        setWishlistedProducts(productIds);
    }, [wishlists]);

    useEffect(() => {
        dispatch(searchProducts(keyword)).then(() => {
            setFilterLoading(true);
            try {
                const mappedProducts = suggestProducts.map((product) => ({
                    ...product,
                    name: getLocalizedText(product.name),
                }));
                setOriginalProducts(mappedProducts);
                setProducts(mappedProducts);
            } finally {
                setFilterLoading(false);
            }
        });
        if (token) {
            dispatch(getAllWishlist());
        }
    }, [dispatch, navigate, vnMode, totalProducts]);

    useEffect(() => {
        setProducts(sortProducts(products, sortOption));
    }, [sortOption]);

    const availabilityOptions = [
        { label: vnMode ? `Còn hàng (${inStockCount})` : `In Stock (${inStockCount})`, value: "InStock", disabled: inStockCount === 0 },
        { label: vnMode ? `Hết hàng (${outOfStockCount})` : `Out of Stock (${outOfStockCount})`, value: "OutOfStock", disabled: outOfStockCount === 0 }
    ];

    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

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

    const handleMinPriceChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            priceRange: [value ?? 0, prev.priceRange[1]],
        }));
    };

    const handleMaxPriceChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            priceRange: [prev.priceRange[0], value ?? 10000000],
        }));
    };

    const handlePriceChange = (values) => {
        setFilters((prev) => ({
            ...prev,
            priceRange: values,
        }));
    };

    const sortProducts = (productsToSort, sortOption) => {
        setFilterLoading(true);
        try {
            if (!productsToSort || productsToSort.length === 0) return [];

            let sortedProducts = [...productsToSort];

            switch (sortOption) {
                case "price-low-high":
                    sortedProducts.sort((a, b) => a.price - b.price);
                    break;
                case "price-high-low":
                    sortedProducts.sort((a, b) => b.price - a.price);
                    break;
                case "name-asc":
                    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case "name-dsc":
                    sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case "rating-high-low":
                    sortedProducts.sort((a, b) => (b.avgVoting || 0) - (a.avgVoting || 0));
                    break;
                case "rating-low-high":
                    sortedProducts.sort((a, b) => (a.avgVoting || 0) - (b.avgVoting || 0));
                    break;
                default:
                    break;
            }
            return sortedProducts;
        } catch {
            toast.error(vnMode ? "Có lỗi khi lọc." : "Failed to filter.");
            return productsToSort;
        } finally {
            setFilterLoading(false);
        }
    };

    const handleApplyFilter = () => {
        setFilterLoading(true);
        setFilterMode(true);
        try {
            let filtered = [...originalProducts];

            if (filters.availability.length > 0) {
                if (filters.availability.includes("inStock")) {
                    filtered = filtered.filter((product) => product.quantity > 0);
                }
                if (filters.availability.includes("outOfStock")) {
                    filtered = filtered.filter((product) => product.quantity === 0);
                }
            }

            filtered = filtered.filter(
                (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
            );

            setProducts(filtered);
        } catch {
            toast.error(vnMode ? "Có lỗi khi lọc." : "Failed to filter.");
        } finally {
            setFilterLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilterMode(false)
        setFilters({
            availability: [],
            priceRange: [0, 10000000],
        });
        setProducts(originalProducts);
    };

    const handleSortChange = (value) => {
        setSortOption(value);
    };

    const addToFavourite = (product) => {
        setSelectedProduct(product);

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

    return (
        <ConfigProvider
            theme={{
                components: {
                    Breadcrumb: {
                        separatorColor: "#1F4ABC",
                        itemColor: "#1F4ABC",
                    },
                },
            }}
        >
            <div className="p-6 max-w-screen-xl mx-auto">

                <div>
                    <div className="flex justify-between items-center my-10">
                        <span>
                            <span className="text-lg font-semibold">{vnMode ? "Có" : "There is"} {suggestProducts.length} {vnMode ? "sản phẩm cho" : "products for"} "{keyword}"</span>
                        </span>
                        <div className="flex">
                            <div className="flex mr-2">
                                <Button
                                    danger
                                    block
                                    variant="solid"
                                    onClick={handleClearFilters}
                                    className={`${filterMode ? '' : 'hidden'} !w-fit !rounded-full mr-2`}
                                >
                                    <ClearOutlined />
                                </Button>
                                <Badge dot={filterMode}>
                                    <Button className="flex items-center gap-2" onClick={() => setOpen(true)}>
                                        <Filter size={18} /> {vnMode ? 'Lọc' : 'Filters'}
                                    </Button>
                                </Badge>
                            </div>
                            <Select defaultValue="default" onChange={handleSortChange} className="">
                                <Option value="default">{vnMode ? 'Sắp xếp' : 'Sort By'}</Option>
                                <Option value="price-low-high">{vnMode ? 'Giá: Thấp đến cao' : 'Price: Low to High'}</Option>
                                <Option value="price-high-low">{vnMode ? 'Giá: Cao đến thấp' : 'Price: High to Low'}</Option>
                                <Option value="name-asc">A-Z</Option>
                                <Option value="name-dsc">Z-A</Option>
                                <Option value="rating-high-low">{vnMode ? 'Đánh giá cao nhất' : 'Best Rated'}</Option>
                                <Option value="rating-low-high">{vnMode ? 'Đánh giá thấp nhất' : 'Worst Rated'}</Option>
                            </Select>
                        </div>
                    </div>
                    <div className="hidden md:block w-1/4">
                        <Drawer zIndex={10000} open={open} onClose={() => setOpen(false)} title={vnMode ? 'Lọc' : "Filters"} placement="left" width={300}>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{vnMode ? "Trạng thái" : "Availability"}</h3>
                                    <Checkbox.Group
                                        options={availabilityOptions}
                                        value={filters.availability}
                                        onChange={(values) => setFilters((prev) => ({ ...prev, availability: values }))}
                                    />
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold">{vnMode ? "Khoảng giá" : "Price Range"}</h3>
                                    <div className="flex items-center space-x-2">
                                        <InputNumber
                                            min={0}
                                            max={10000000}
                                            value={filters.priceRange[0]}
                                            onChange={handleMinPriceChange}
                                            formatter={(value) => formatCurrency(value)}
                                            parser={(value) => value.replace(/\./g, "")}
                                            className="w-32"
                                        />
                                        <span>—</span>
                                        <InputNumber
                                            min={0}
                                            max={10000000}
                                            value={filters.priceRange[1]}
                                            onChange={handleMaxPriceChange}
                                            formatter={(value) => formatCurrency(value)}
                                            parser={(value) => value.replace(/\./g, "")}
                                            className="w-32"
                                        />
                                    </div>
                                    <Slider
                                        range
                                        min={0}
                                        max={10000000}
                                        value={filters.priceRange}
                                        onChange={handlePriceChange}
                                        tooltip={{
                                            formatter: (value) => `${formatCurrency(value)} đ`,
                                        }}
                                    />
                                </div>

                                <Button type="primary" block onClick={handleApplyFilter}>
                                    {vnMode ? "Áp dụng bộ lọc" : "Apply Filters"}
                                </Button>
                            </div>
                        </Drawer>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filterLoading ? (
                            <div className="col-span-4 flex justify-center items-center h-96">
                                <Spin size="large" />
                            </div>
                        ) : products?.length > 0 ? (
                            products.slice(
                                (currentPage - 1) * PRODUCTS_PER_PAGE,
                                currentPage * PRODUCTS_PER_PAGE
                            ).map((product, index) => {
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
                                    <div key={index} className="px-6">
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
                                                    <Rate
                                                        allowHalf
                                                        value={product.avgVoting}
                                                        className="mb-2 mr-2 text-sm"
                                                        disabled
                                                    />
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
                                                    onClick={() => handleAddProduct(product?.productId, 1)}
                                                    icon={<ShoppingCartOutlined />}
                                                    className="absolute h-10 w-full !rounded-full bottom-0"
                                                >
                                                    {vnMode ? "Thêm vào giỏ hàng" : "Add to Cart"}
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-4 text-center py-10 text-gray-500">
                                <p>
                                    {vnMode
                                        ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn."
                                        : "No products found matching your filters."}
                                </p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                current={currentPage}
                                total={totalProducts}
                                pageSize={PRODUCTS_PER_PAGE}
                                onChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
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
        </ConfigProvider>
    );
};

export default SearchResult;
