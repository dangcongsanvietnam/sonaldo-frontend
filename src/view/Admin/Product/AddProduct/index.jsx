import { Button, Form, Input, Tag, Cascader, Select, InputNumber, ColorPicker } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import { addNewProduct } from "../../../../services/productService";
import defaultAvatar from "../../../../assets/download.png";
import { suggestTagsFromText } from "../../../../utils/suggestTagsFromText";
import ImageUpload from "../../../../components/ImageUpload";
import { getAdminBrands } from "../../../../services/brandService";
import { getAdminCategories } from "../../../../services/categoryService";
import { toast } from "react-toastify";


const { TextArea } = Input;
const { SHOW_CHILD } = Cascader;

const AddProduct = () => {
  const [avatar, setAvatar] = useState(null);
  const [form] = Form.useForm();
  const categoryItem = useSelector((state) => state?.category?.categories?.data);
  const brandCategory = useSelector((state) => state?.brand?.brands?.data);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputConfirmed, setInputConfirmed] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const { vnMode } = useOutletContext();

  useEffect(() => {
    if (!avatar) {
      fetch(defaultAvatar)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "default-avatar.png", { type: "image/png" });
          setAvatar(file);
        });
    }
  }, [avatar]);

  useEffect(() => {
    dispatch(getAdminBrands());
    dispatch(getAdminCategories());
  }, [dispatch]);

  useEffect(() => {
    handleTagBlur();
  }, [tags]);

  const brandOptions = Array.isArray(brandCategory)
    ? brandCategory.map((brand) => ({
      label: brand?.brandName,
      value: brand?.brandId,
      children: Array.isArray(brand.brandCategories)
        ? brand.brandCategories.map((subBrand) => ({
          label: subBrand?.name,
          value: subBrand?.brandCategoryId,
        }))
        : [],
    }))
    : [];

  const categoryOptions = Array.isArray(categoryItem)
    ? categoryItem.map((category) => ({
      label: category?.categoryName,
      value: category?.categoryId,
      children: Array.isArray(category.categoryItems)
        ? category.categoryItems.map((subCategory) => ({
          label: subCategory?.name,
          value: subCategory?.categoryItemId,
        }))
        : [],
    }))
    : [];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputConfirmed) return;
    setInputConfirmed(true);

    const sanitizedInput = inputValue.trim();
    if (sanitizedInput && !tags.includes(sanitizedInput)) {
      if (sanitizedInput.startsWith("#")) {
        setTags((prevTags) => [...prevTags, sanitizedInput]);
        setInputValue("");
      } else {
        toast.error(vnMode ? "Tag phải bắt đầu với ký tự #" : "Tag must be start with #");
      }
    } else if (!sanitizedInput) {
      setInputValue("");
    }

    setTimeout(() => setInputConfirmed(false), 100);
  };

  const handleTagBlur = () => {
    const name = form.getFieldValue("productName");
    const description = form.getFieldValue("description");
    const selectedCategories = form.getFieldValue("category") || [];
    const selectedBrandId = form.getFieldValue("brand");

    const categoryNames = selectedCategories.flatMap(categoryId => {
      const category = categoryOptions.find(opt => opt.value === categoryId[0]);
      return category ? [category.label, category?.children?.find(child => child?.value === categoryId[1]).label] : [];
    });

    let brandName = "";
    let brandCategoryName = "";
    if (selectedBrandId) {
      const brand = brandOptions.find(opt => opt.value === selectedBrandId[0]);
      if (brand) {
        brandName = brand.label;
        brandCategoryName = brandOptions.find(opt => opt.children.find(child => child.value === selectedBrandId[1])) ? brand.children[0].label : "";
      }
    }

    if (name || description || categoryNames.length || brandName) {
      const suggested = suggestTagsFromText(name, description, categoryNames, brandName, brandCategoryName);
      const uniqueSuggestions = suggested.filter((tag) => !tags.includes(tag));
      setSuggestedTags(uniqueSuggestions);
    }
  };

  const handleSubmit = (values) => {
    const filteredTags = tags
      .filter((tag) => tag.trim() !== "")
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag.trim()}`));

    const stateMapping = {
      1: "Lock",
      2: "Preorder",
      3: "NewArrival",
      4: "Normal"
    };

    const updateValues = {
      name: values.productName,
      description: values.description,
      files: fileList.map((file) => file?.originFileObj),
      price: values.price,
      brandCategoryId: values.brand[1],
      categoryItems: values.category.map((subcategory) => subcategory[1]),
      status: stateMapping[values.state] || values.state,
      tagsDescription: filteredTags.join(" "),
      quantity: values.quantity,
      color: values.color.toHexString() || "#000000"
    };

    if (fileList.length < 1) {
      toast.error(vnMode ? "Bắt buộc phải có ít nhất 1 ảnh" : "Require at least one picture");
      return;
    }

    setIsSaving(true);
    dispatch(addNewProduct(updateValues))
      .unwrap()
      .then(() => navigate("/admin/products"))
      .catch()
      .finally(() => setIsSaving(false));
  };

  const filter = (inputValue, path) =>
    path.some((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={(_, allValues) => handleTagBlur(allValues)}>
        <div className="flex gap-x-28">
          <div className="w-1/2 pl-3">
            <Form.Item
              label={vnMode ? "Tên sản phẩm" : "Product Name"}
              name="productName"
            >
              <Input onBlur={handleTagBlur} />
            </Form.Item>

            <Form.Item
              label={vnMode ? "Mô tả sản phẩm" : "Product Description"}
              name="description"
            >
              <TextArea
                onBlur={handleTagBlur}
                rows={4}
                placeholder={vnMode ? "Mô tả ..." : "Description ..."}
              />
            </Form.Item>

            <div className="mb-5">
              <div className="tags-container">
                <div className="mb-1">{vnMode ? "Tag sản phẩm" : "Product Tags"}</div>
                {tags.map((tag, index) => (
                  <Tag
                    key={`${tag}-${index}`}
                    closable
                    onClose={() => setTags((prevTags) => prevTags.filter((t) => t !== tag))}
                    style={{ marginBottom: "8px" }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>

              <div className="flex gap-2 mt-1">
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    handleInputConfirm();
                  }}
                  onBlur={handleTagBlur}
                  placeholder={vnMode ? "Nhập tag (bắt đầu với #)" : "Enter tag (start with #)"}
                  style={{ width: "200px", marginBottom: "8px" }}
                />
                <Button type="primary" onClick={handleInputConfirm}>
                  {vnMode ? "Thêm tag" : "Add Tag"}
                </Button>
              </div>

              {suggestedTags.length > 0 && (
                <div className="mt-4">
                  <div className="suggested-tags">
                    <small className="mr-2">{vnMode ? "Gợi ý tag:" : "Suggested Tags:"}</small>
                    {suggestedTags.slice(0, 5).map((tag) => (
                      <Tag
                        key={tag}
                        color="blue"
                        onClick={() => !tags.includes(tag) && setTags((prevTags) => [...prevTags, tag])}
                        style={{ cursor: "pointer", marginBottom: "8px" }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full gap-4">
              <Form.Item
                label={vnMode ? "Giá sản phẩm" : "Product Price"}
                name="price"
              >
                <InputNumber
                  formatter={(value) =>
                    `${vnMode ? "₫" : "$"} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/[^0-9]/g, "")}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                label={vnMode ? "Trạng thái sản phẩm" : "Product Status"}
                name="status"
                className="w-1/2"
              >
                <Select
                  options={[
                    { value: "1", label: vnMode ? "Khoá" : "Lock" },
                    { value: "2", label: vnMode ? "Đặt trước" : "Preorder" },
                    { value: "3", label: vnMode ? "Sản phẩm mới" : "New Arrival" },
                    { value: "4", label: vnMode ? "Bình thường" : "Normal" },
                  ]}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                label={vnMode ? "Số lượng" : "Product Quantity"}
                name="quantity"
              >
                <InputNumber min={0} max={100000} className="w-full" />
              </Form.Item>
            </div>
          </div>

          <div className="w-2/6">
            <Form.Item
              label={vnMode ? "Ảnh sản phẩm" : "Product Image"}
            >
              <ImageUpload fileList={fileList} setAvatar={setAvatar} setFileList={setFileList} />
            </Form.Item>

            <Form.Item
              label={vnMode ? "Màu nền" : "Background Color"}
              name="color"
            >
              <ColorPicker format="hex" />
            </Form.Item>

            <Form.Item
              label={vnMode ? "Hãng sản phẩm" : "Product Brand"}
              name="brand"
            >
              <Cascader
                options={brandOptions}
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
              />
            </Form.Item>

            <Form.Item
              label={vnMode ? "Danh mục sản phẩm" : "Product Categories"}
              name="category"
            >
              <Cascader
                options={categoryOptions}
                multiple
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
              />
            </Form.Item>
          </div>
        </div>

        <Button type="primary" htmlType="submit" loading={isSaving} className="mt-5">
          {vnMode ? "Lưu" : "Save"}
        </Button>
      </Form>
    </>

  );
};

export default AddProduct;
