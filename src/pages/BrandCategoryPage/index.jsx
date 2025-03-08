import React, { useEffect, useMemo, useState } from "react";
import { Badge, Breadcrumb, Button, Card, Checkbox, ConfigProvider, Drawer, Input, InputNumber, Modal, Rate, Select, Slider } from "antd";
import { ArrowRightOutlined, ClearOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Option } from "antd/es/mentions";
import { Filter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getBrandCategoryDetail } from "../../services/brandService";
import { useLoading } from "../../provider/LoadingProvider";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { getProductsByBrandCategory } from "../../services/productService";
import { addToFavorite, getAllWishlist, removeFromFavorite } from "../../services/wishlistService";
import Cookies from "js-cookie";

const BrandCategoryPage = () => {
    const { vnMode } = useOutletContext();
    const { startLoading, stopLoading } = useLoading();
    const [sortOption, setSortOption] = useState("default");
    const [inStockCount, setInStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const navigate = useNavigate();
    const { brandCategoryId } = useParams();
    const { brandId } = useParams();
    const getLocalizedText = (text) => {
        if (!text) return "";
        const parts = text.split(" || ");
        return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
    };
    const brandCategoryData = useSelector((state) => state?.brand?.brandCategoryDetailItem?.data);

    const brandCategoryDetail = useMemo(() => {
        if (!brandCategoryData) return null;

        return {
            ...brandCategoryData,
            name: getLocalizedText(brandCategoryData.name),
            description: getLocalizedText(brandCategoryData.description),
            brandName: getLocalizedText(brandCategoryData.brandName),
        };
    }, [brandCategoryData]);

    const ageList = [
        { name: "0-2 Years || 0-2 Tuổi", count: 0, disabled: true },
        { name: "3-4 Years || 3-4 Tuổi", count: 0, disabled: true },
        { name: "5-7 Years || 5-7 Tuổi", count: 0, disabled: true },
        { name: "8-10 Years || 8-10 Tuổi", count: 0, disabled: true },
        { name: "11-12 Years || 11-12 Tuổi", count: 0, disabled: true },
        { name: "13-14 Years || 13-14 Tuổi", count: 0, disabled: true },
        { name: "15-16 Years || 15-16 Tuổi", count: 0, disabled: true },
        { name: "17 Years || 17 Tuổi", count: 0, disabled: true },
        { name: "18+ Years || 18+ Tuổi", count: 0, disabled: true }
    ].map(age => ({ ...age, name: getLocalizedText(age.name) }));

    const [open, setOpen] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [ageCategory, setAgeCategory] = useState([]);
    const [filters, setFilters] = useState({
        category: [],
        age: [],
        availability: [],
        priceRange: [0, 10000000],
    });
    const [filterLoading, setFilterLoading] = useState(false);
    const [filterMode, setFilterMode] = useState(false);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const MAX_CATEGORIES = 10;
    const dispatch = useDispatch();
    const wishlists = useSelector(state => state.wishlist.wishlists);
    const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
    const [addLoading, setAddLoading] = useState("" || null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    useEffect(() => {
        const inStock = allProducts.filter(product => product.quantity > 0).length;
        const outOfStock = allProducts.filter(product => product.quantity === 0).length;
        setInStockCount(inStock);
        setOutOfStockCount(outOfStock);
    }, [allProducts]);

    useEffect(() => {
        const productIds = new Set(
            wishlists.flatMap(wishlist => wishlist.wishlistItems.map(item => item.productId))
        );
        setWishlistedProducts(productIds);
    }, [wishlists]);

    useEffect(() => {
        const fetchData = async () => {
            startLoading();
            try {
                await dispatch(getBrandCategoryDetail({ brandId, brandCategoryId }))
                    .unwrap()
                    .then(async () => {
                        const response = await dispatch(getProductsByBrandCategory(brandCategoryId)).unwrap();
                        const products = response.data.map(product => ({
                            ...product,
                            name: getLocalizedText(product.name),
                            description: getLocalizedText(product.description),
                            categoryItems: product.categoryItems?.map(categoryItem => ({
                                ...categoryItem,
                                name: getLocalizedText(categoryItem.name),
                                categoryName: getLocalizedText(categoryItem.categoryName),
                            })),
                            brandCategory: {
                                brandName: getLocalizedText(product.brandCategory?.brandName),
                                name: getLocalizedText(product.brandCategory?.name),
                            },
                        }));

                        const categoryMap = new Map();
                        const updatedAgeList = ageList.map(age => ({ ...age, count: 0, disabled: true }));

                        products.forEach(product => {
                            product?.categoryItems.forEach(categoryItem => {
                                const key = categoryItem.categoryItemId;
                                const categoryName = getLocalizedText(categoryItem.categoryName);

                                if (categoryName !== "Mua Sắm Theo Độ Tuổi" && categoryName !== "Shop By Age") {
                                    if (!categoryMap.has(key)) {
                                        categoryMap.set(key, {
                                            categoryItem: {
                                                ...categoryItem,
                                                name: getLocalizedText(categoryItem.name),
                                                description: getLocalizedText(categoryItem.description),
                                            },
                                            count: 1
                                        });
                                    } else {
                                        categoryMap.get(key).count += 1;
                                    }
                                }

                                const ageItem = updatedAgeList.find(age => age.name === getLocalizedText(categoryItem.name));
                                if (ageItem) {
                                    ageItem.count += 1;
                                    ageItem.disabled = false;
                                }
                            });
                        });

                        setCategoryList(Array.from(categoryMap.values()));
                        setAllProducts(products);
                        setAgeCategory(updatedAgeList);
                    })
                    .finally(() => {
                        stopLoading();
                    })
            } catch {
                stopLoading();
            }
        }
        fetchData();
        dispatch(getAllWishlist());
    }, [dispatch, navigate]);

    useEffect(() => {
        const sortedAllProducts = sortProducts(filterMode ? displayedProducts : allProducts, sortOption);
        if (filterMode) {
            if (JSON.stringify(sortedAllProducts) !== JSON.stringify(displayedProducts)) {
                setDisplayedProducts(sortedAllProducts);
            }
        } else {
            if (JSON.stringify(sortedAllProducts) !== JSON.stringify(allProducts)) {
                setAllProducts(sortedAllProducts);
            }
        }
    }, [sortOption]);

    const categoryOptions = categoryList.map(ctgr => ({
        label: `${ctgr.categoryItem.name} (${ctgr.count})`,
        value: ctgr.categoryItem.name
    }));

    const displayedCategories = showAllCategories ? categoryOptions : categoryOptions.slice(0, MAX_CATEGORIES);

    const ageOptions = ageCategory.map(ctgr => ({
        label: `${ctgr.name} (${ctgr.count})`,
        value: ctgr.name,
        disabled: ctgr.disabled
    }));

    const availabilityOptions = [
        { label: vnMode ? `In Stock (${inStockCount})` : `Còn hàng (${inStockCount})`, value: "inStock", disabled: inStockCount === 0 },
        { label: vnMode ? `Out of Stock (${outOfStockCount})` : `Hết hàng (${outOfStockCount})`, value: "outOfStock", disabled: outOfStockCount === 0 }
    ];

    const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value);

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
                    return [...products].sort((a, b) => a.name.localeCompare(b.name));

                case "name-dsc":
                    return [...products].sort((a, b) => b.name.localeCompare(a.name));

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

    const handleApplyFilter = () => {
        setFilterLoading(true);
        try {
            let filtered = allProducts;

            if (filters.category.length > 0 || filters.age.length > 0) {
                filtered = filtered.filter((product) =>
                    product.categoryItems.some((categoryItem) =>
                        filters.category.includes(categoryItem.name) || filters.age.includes(categoryItem.name)
                    )
                );
            }

            if (filters.availability.length > 0) {
                if (filters.availability.includes("inStock")) {
                    filtered = filtered.filter((product) => product.quantity > 0);
                } else if (filters.availability.includes("outOfStock")) {
                    filtered = filtered.filter((product) => product.quantity = 0);
                } else {
                    return;
                }
            }

            filtered = filtered.filter(
                (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
            );

            setDisplayedProducts(filtered);
            setFilterMode(true);
        } catch (error) {
            toast.error(getLocalizedText("Failed to filter. || Có lỗi khi lọc."));
        } finally {
            setFilterLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilterLoading(true);
        try {
            setFilters({
                category: [],
                age: [],
                availability: [],
                priceRange: [0, 10000000]
            });
            setDisplayedProducts([]);
            setFilterMode(false);
        } catch (error) {
            toast.error(getLocalizedText("Failed to filter. || Có lỗi khi lọc."));
        } finally {
            setFilterLoading(false);
        }
    };

    const handleSortChange = (value) => {
        setSortOption(value);
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
                <Breadcrumb
                    separator=">"
                    className="mb-4 font-bold"
                    style={{ fontSize: "18px", color: "#1F4ABC" }}
                >
                    <Breadcrumb.Item>
                        <span onClick={() => navigate("/")} className="cursor-pointer text-sm underline">
                            {vnMode ? 'Trang Chủ' : 'Home'}
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span onClick={() => navigate(`/brand/${brandId}`)} className="cursor-pointer text-sm text-[#1F4ABC] underline">
                            {brandCategoryDetail?.brandName || "Brand"}
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span onClick={() => navigate(`/brand/${brandId}/${brandCategoryId}`)} className="cursor-pointer text-sm text-[#1F4ABC] underline">
                            {brandCategoryDetail?.name || "Brand Category"}
                        </span>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <h1 style={{
                    fontSize: "50px",
                    marginBottom: "10px"
                }}>{brandCategoryDetail?.name}</h1>
                <p style={{
                    marginBottom: "20px"
                }}>{brandCategoryDetail?.description}</p>
                <div className="flex justify-between items-center my-10">
                    <span className="text-lg font-semibold">{allProducts.length} {vnMode ? "sản phẩm" : "products"}</span>
                    <div className="flex w-1/4">
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
                        <Select defaultValue="default" onChange={handleSortChange} className="w-48">
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
                <div>
                    <div className="hidden md:block w-1/4">
                        <Drawer open={open} onClose={() => setOpen(false)} title={vnMode ? 'Lọc' : "Filters"} placement="left" width={300}>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{vnMode ? "Danh mục" : "Category"}</h3>
                                    <Checkbox.Group
                                        options={displayedCategories}
                                        value={filters.category}
                                        onChange={(values) => setFilters((prev) => ({ ...prev, category: values }))}
                                    />
                                    {categoryOptions.length > MAX_CATEGORIES && (
                                        <button
                                            onClick={() => setShowAllCategories(!showAllCategories)}
                                            className="text-black underline mt-2"
                                        >
                                            {showAllCategories ? "Show Less" : "Show More"}
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{vnMode ? "Nhóm tuổi" : "Age Group"}</h3>
                                    <Checkbox.Group
                                        options={ageOptions}
                                        value={filters.age}
                                        onChange={(values) => setFilters((prev) => ({ ...prev, age: values }))}
                                    />
                                </div>
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
                    <div className="grid grid-cols-4 gap-3">
                        {filterLoading ? (
                            <div className="col-span-4 flex justify-center items-center h-96">
                                <Spin size="large" />
                            </div>
                        ) : (
                            (filterMode ? displayedProducts : allProducts).length > 0 ? (
                                (filterMode ? displayedProducts : allProducts).map((product, index) => {
                                    const isWishlisted = wishlistedProducts.has(product.productId);

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
                                                            src={`data:image/jpeg;base64,${product?.images[0]?.file.data}`}
                                                            className="h-[250px] w-full object-cover rounded-t-lg"
                                                        />
                                                    </div>
                                                }
                                                className="shadow-lg rounded-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                                                style={{ width: 300, height: 500 }}
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
                                })
                            ) : (
                                <div className="col-span-4 text-center py-10 text-gray-500">
                                    <p>{vnMode ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn." : "No products found matching your filters."}</p>
                                </div>
                            )
                        )}
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
        </ConfigProvider>
    );
};

export default BrandCategoryPage;
