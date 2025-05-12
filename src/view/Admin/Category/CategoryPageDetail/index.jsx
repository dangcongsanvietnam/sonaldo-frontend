import React, { useEffect, useMemo, useState } from "react";
import { Badge, Breadcrumb, Button, Card, Checkbox, ConfigProvider, Drawer, Input, InputNumber, Modal, Pagination, Rate, Select, Slider } from "antd";
import { ClearOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Filter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useLoading } from "../../../../provider/LoadingProvider";
import { getCategoryDetail } from "../../../../services/categoryService";
import { getProductsByCategoryItem } from "../../../../services/productService";
import { getAdminBrands } from "../../../../services/brandService";
import { addToFavorite, getAllWishlist, removeFromFavorite } from "../../../../services/wishlistService";
import Cookies from "js-cookie";
import { useDrawer } from "../../../../components/Layout";
import { addProductToCart, getUserCart } from "../../../../services/cartService";

const { Option } = Select;
const PRODUCTS_PER_PAGE = 20;

const CategoryPageDetail = () => {
  const { vnMode } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1);
  const { startLoading, stopLoading } = useLoading();
  const [sortOption, setSortOption] = useState("default");
  const [inStockCount, setInStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [bagLoading, setBagLoading] = useState("");
  const { toggleDrawer } = useDrawer();
  const token = Cookies.get("token");
  const [addLoading, setAddLoading] = useState("" || null);
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const getLocalizedText = (text) => {
    if (!text) return "";
    const parts = text.split(" || ");
    return vnMode ? parts[1]?.trim() || parts[0]?.trim() : parts[0]?.trim();
  };
  const memoizedCategory = useSelector((state) => state?.category?.category?.data);

  const category = useMemo(() => {
    if (!memoizedCategory) return null;

    return {
      ...memoizedCategory,
      name: getLocalizedText(memoizedCategory.name),
      description: getLocalizedText(memoizedCategory.description),
      categoryItems: memoizedCategory.categoryItems?.map(categoryItem => ({
        ...categoryItem,
        name: getLocalizedText(categoryItem.name),
        description: getLocalizedText(categoryItem.description),
        categoryName: getLocalizedText(categoryItem.categoryName)
      }))
    };
  }, [memoizedCategory, vnMode]);

  const ageList = useMemo(() => {
    return [
      { name: "0-2 Years || 0-2 Tuổi", count: 0, disabled: true },
      { name: "3-4 Years || 3-4 Tuổi", count: 0, disabled: true },
      { name: "5-7 Years || 5-7 Tuổi", count: 0, disabled: true },
      { name: "8-12 Years || 8-12 Tuổi", count: 0, disabled: true },
      { name: "13-17 Years || 13-17 Tuổi", count: 0, disabled: true },
      { name: "18+ Years || 18+ Tuổi", count: 0, disabled: true }
    ].map(age => ({ ...age, name: getLocalizedText(age.name) }));
  }, [vnMode]);

  const [open, setOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [ageCategory, setAgeCategory] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    age: [],
    availability: [],
    priceRange: [0, 10000000],
  });
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterMode, setFilterMode] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const MAX_CATEGORIES = 10;
  const dispatch = useDispatch();
  const wishlists = useSelector(state => state.wishlist.wishlists);
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
  const products = filterMode ? displayedProducts : allProducts;
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

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
    fetchData();
    if (token) {
      dispatch(getAllWishlist());
    }
  }, [dispatch, navigate, vnMode]);

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

  const fetchData = async () => {
    startLoading();
    try {
      await dispatch(getAdminBrands()).unwrap().then((res) => {
        const brands = res?.data?.map(brand => ({
          ...brand,
          brandName: getLocalizedText(brand.brandName),
          brandCategories: brand.brandCategories.map(brandCategory => ({
            ...brandCategory,
            name: getLocalizedText(brandCategory.name),
            description: getLocalizedText(brandCategory.description),
            brandId: brand.brandId,
            brandName: getLocalizedText(brand.brandName)
          }))
        })) || [];

        fetchCategoryDetail(brands);
      })
    } catch (error) {
      toast.error(vnMode ? "Tải dữ liệu danh mục thất bại." : "Failed to load category data.");
    } finally {
      stopLoading();
    }
  };

  const fetchCategoryDetail = async (brandsData) => {
    startLoading(true);
    try {
      const res = await dispatch(getCategoryDetail(categoryId)).unwrap();
      const categoryItems = (res.data?.categoryItems || []).map(categoryItem => ({
        ...categoryItem,
        name: getLocalizedText(categoryItem.name),
        description: getLocalizedText(categoryItem.description),
        categoryName: getLocalizedText(categoryItem.categoryName)
      }));

      const productPromises = categoryItems.map(async (category) => {
        const response = await dispatch(getProductsByCategoryItem(category.categoryItemId)).unwrap();
        return {
          ...category,
          name: getLocalizedText(category.name),
          description: getLocalizedText(category.description),
          products: response.data.map(product => ({
            ...product,
            name: getLocalizedText(product.name),
            description: getLocalizedText(product.description),
            categoryItems: product.categoryItems?.map(categoryItem => ({
              ...categoryItem,
              name: getLocalizedText(categoryItem.name),
              categoryName: getLocalizedText(categoryItem.categoryName),
              categoryId: category.categoryItemId, // Ensure correct categoryId
            })),
            brandCategory: {
              brandName: getLocalizedText(product.brandCategory?.brandName),
              name: getLocalizedText(product.brandCategory?.name),
              brandCategoryId: product.brandCategory?.brandCategoryId,
            },
          })),
        };
      });

      const categoryProducts = await Promise.all(productPromises);
      const sortedCategories = categoryProducts.sort((a, b) => b.products.length - a.products.length);

      const allProductsArray = sortedCategories
        .flatMap(category => category.products)
        .filter((product, index, self) =>
          index === self.findIndex(p => p.productId === product.productId)
        );

      setAllProducts(allProductsArray);

      const brandCategoryMap = new Map();
      allProductsArray.forEach(product => {
        const brandCategory = product.brandCategory;
        if (brandCategory?.brandCategoryId) {
          const existing = brandCategoryMap.get(brandCategory.brandCategoryId);
          brandCategoryMap.set(brandCategory.brandCategoryId, {
            name: brandCategory.name,
            id: brandCategory.brandCategoryId,
            count: (existing?.count || 0) + 1,
          });
        }
      });

      categoryItems?.forEach(categoryItem => {
        const existing = brandCategoryMap.get(categoryItem.categoryItemId);
        brandCategoryMap.set(categoryItem.categoryItemId, {
          name: categoryItem.name,
          id: categoryItem.categoryItemId,
          count: (existing?.count || 0) + 1,
        });
      });

      const brandCategories = Array.from(brandCategoryMap.values());

      const brandListFormatted = brandsData
        ?.map(brand => {
          const matchingBrandCategories = brand.brandCategories?.filter(category =>
            brandCategoryMap.has(category.brandCategoryId)
          );

          const count = allProductsArray.reduce(
            (acc, product) => matchingBrandCategories?.some(category => category.brandCategoryId === product.brandCategory?.brandCategoryId) ? acc + 1 : acc,
            0
          );

          return count > 0
            ? {
              brandName: brand.brandName,
              brandId: brand.brandId,
              count,
            }
            : {
              brandName: brand.brandName,
              brandId: brand.brandId,
              count: 0
            };
        })
        .filter(Boolean);


      setCategoryList(brandCategories);
      setBrandList(brandListFormatted);

      const updatedAgeList = ageList.map(age => ({ ...age, count: 0, disabled: true }));
      allProductsArray.forEach(product => {
        product?.categoryItems?.forEach(categoryItem => {
          const ageItem = updatedAgeList.find(age => age.name === getLocalizedText(categoryItem.name));
          if (ageItem) {
            ageItem.count += 1;
            ageItem.disabled = false;
          }
        });
      });

      setAgeCategory(updatedAgeList);
    } catch (error) {
    } finally {
      stopLoading(false);
    }
  };

  const categoryOptions = categoryList?.map(ctgr => ({
    label: `${ctgr?.name} (${ctgr?.count})`,
    value: ctgr?.id
  }));

  const brandOptions = brandList?.map(ctgr => ({
    label: `${ctgr?.brandName} (${ctgr?.count})`,
    value: ctgr?.brandName,
    disabled: ctgr.count > 0 ? false : true
  })).sort((a, b) => a.disabled - b.disabled);

  const displayedCategories = showAllCategories ? categoryOptions : categoryOptions.slice(0, MAX_CATEGORIES);

  const displayedBrands = showAllBrands ? brandOptions : brandOptions?.slice(0, MAX_CATEGORIES);

  const ageOptions = ageCategory.map(ctgr => ({
    label: `${ctgr.name} (${ctgr.count})`,
    value: ctgr.name,
    disabled: ctgr.disabled
  }));

  const availabilityOptions = [
    { label: vnMode ? `Còn hàng (${inStockCount})` : `In Stock (${inStockCount})`, value: "inStock", disabled: inStockCount === 0 },
    { label: vnMode ? `Hết hàng (${outOfStockCount})` : `Out of Stock (${outOfStockCount})`, value: "outOfStock", disabled: outOfStockCount === 0 }
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
    } catch {
      toast.error(vnMode ? "Có lỗi khi lọc." : "Failed to filter.");
    } finally {
      setFilterLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setFilterLoading(true);
    try {
      let filtered = allProducts;

      if (filters.category.length > 0 || filters.age.length > 0) {
        filtered = filtered.filter((product) => {
          return (
            product.categoryItems.some((categoryItem) =>
              filters.category.includes(categoryItem.categoryItemId) ||
              filters.age.includes(categoryItem.name)
            ) ||
            filters.category.includes(product.brandCategory.brandCategoryId)
          );
        });
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

      if (filters.brand.length > 0) {
        filtered = filtered.filter((product) => {
          return filters.brand.includes(product.brandCategory.brandName)
        })
      }

      filtered = filtered.filter(
        (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );

      setDisplayedProducts(filtered);
      setFilterMode(true);
    } catch {
      toast.error(vnMode ? "Có lỗi khi lọc." : "Failed to filter.");
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
        brand: [],
        availability: [],
        priceRange: [0, 10000000]
      });
      setDisplayedProducts([]);
      setFilterMode(false);
    } catch {
      toast.error(vnMode ? "Có lỗi khi lọc." : "Failed to filter.");
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
        <Breadcrumb
          separator=">"
          className="mb-4 font-bold"
          style={{ fontSize: "18px", color: "#1F4ABC" }}
          items={[
            {
              title: (
                <span onClick={() => navigate("/")} className="cursor-pointer text-sm underline">
                  {vnMode ? "Trang Chủ" : "Home"}
                </span>
              ),
            },
            {
              title: (
                <span
                  onClick={() => navigate(`/category/${categoryId}`)}
                  className="cursor-pointer text-sm text-[#1F4ABC] underline"
                >
                  {category?.name || "Category"}
                </span>
              ),
            },
          ]}
        />

        <h1 style={{
          fontSize: "50px",
          marginBottom: "10px"
        }}>{category?.name}</h1>
        <p style={{
          marginBottom: "20px"
        }}>{category?.description}</p>

        <div>
          <div className="flex justify-between items-center my-10">
            <span className="text-lg font-semibold">{allProducts.length} {vnMode ? "sản phẩm" : "products"}</span>
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
                  <h3 className="text-lg font-semibold">{vnMode ? "Danh mục" : "Category"}</h3>
                  <Checkbox.Group
                    options={displayedCategories}
                    value={filters.category}
                    onChange={(values) => setFilters((prev) => ({ ...prev, category: values }))}
                  />
                  {categoryOptions?.length > MAX_CATEGORIES && (
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
                  <h3 className="text-lg font-semibold">{vnMode ? "Thương hiệu" : "Brand"}</h3>
                  <Checkbox.Group
                    options={displayedBrands}
                    value={filters.brand}
                    onChange={(values) => setFilters((prev) => ({ ...prev, brand: values }))}
                  />
                  {brandOptions?.length > MAX_CATEGORIES && (
                    <button
                      onClick={() => setShowAllBrands(!showAllBrands)}
                      className="text-black underline mt-2"
                    >
                      {showAllBrands ? "Show Less" : "Show More"}
                    </button>
                  )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filterLoading ? (
              <div className="col-span-4 flex justify-center items-center h-96">
                <Spin size="large" />
              </div>
            ) : totalProducts > 0 ? (
              paginatedProducts.map((product, index) => {
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
                            src={`data:image/jpeg;base64,${product?.images[0]?.file.data}`}
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

export default CategoryPageDetail;
