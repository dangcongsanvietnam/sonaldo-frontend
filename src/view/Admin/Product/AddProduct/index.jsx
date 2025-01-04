import { Button, Form, Input, Tag, Cascader, Select, InputNumber } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addNewProduct } from "../../../../services/productService";
import defaultAvatar from "../../../../assets/download.png";
import { suggestTagsFromText } from "../../../../utils/suggestTagsFromText";
import ImageUpload from "../../../../components/ImageUpload";


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
    handleTagBlur();
  }, [form.getFieldValue("productName"), form.getFieldValue("description"), tags]);

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
        notification.error({ message: "Lỗi", description: "Tag phải bắt đầu với ký tự #" });
      }
    } else if (!sanitizedInput) {
      setInputValue("");
    }

    setTimeout(() => setInputConfirmed(false), 100);
  };

  const handleTagBlur = () => {
    const name = form.getFieldValue("productName");
    const description = form.getFieldValue("description");

    if (name || description) {
      const suggested = suggestTagsFromText(name, description);
      const uniqueSuggestions = suggested.filter((tag) => !tags.includes(tag));
      setSuggestedTags(uniqueSuggestions);
    }
  };

  const handleSubmit = (values) => {
    const filteredTags = tags
      .filter((tag) => tag.trim() !== "")
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag.trim()}`));

    const stateMapping = {
      1: "Out of stock",
      2: "In Stock",
      3: "Preorder",
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
    };

    if (fileList.length < 1) {
      notification.error({ message: "Thất bại", description: "Bắt buộc phải có ít nhất 1 ảnh" });
      return;
    }

    setIsSaving(true);
    dispatch(addNewProduct(updateValues))
      .unwrap()
      .then(() => navigate("/admin/products"))
      .catch((err) => console.log(err))
      .finally(() => setIsSaving(false));
  };

  const filter = (inputValue, path) =>
    path.some((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-5">Thêm sản phẩm</h1>

        </div>

        <div className="flex gap-x-28">
          <div className="w-1/2 pl-3">
            <Form.Item label="Tên sản phẩm" name="productName">
              <Input onBlur={handleTagBlur} />
            </Form.Item>

            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea onBlur={handleTagBlur} rows={4} placeholder="Mô tả ..." />
            </Form.Item>

            <div className="mb-5">
              <div className="tags-container">
                <div className="mb-1">Tag sản phẩm</div>
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
                  placeholder="Nhập tag (bắt đầu với #)"
                  style={{ width: "200px", marginBottom: "8px" }}
                />
                <Button type="primary" onClick={handleInputConfirm}>Thêm tag</Button>
              </div>

              {suggestedTags.length > 0 && (
                <div className="mt-4">
                  <div className="suggested-tags">
                    <small className="mr-2">Gợi ý tag:</small>
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

              <Form.Item label="Giá sản phẩm" name="price">
                <InputNumber
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/₫\s?|\D/g, "")}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item label="Số lượng sản phẩm" name="quantity">
                <InputNumber min={1} max={100000} className="w-full" />
              </Form.Item>

              <Form.Item label="Trạng thái sản phẩm" name="status">
                <Select
                  options={[
                    { value: "1", label: "Out of stock" },
                    { value: "2", label: "In Stock" },
                    { value: "3", label: "Preorder" },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          <div className="w-2/6">
            <Form.Item label="Ảnh sản phẩm">
              <ImageUpload fileList={fileList} setAvatar={setAvatar} setFileList={setFileList} />
            </Form.Item>
            <Form.Item label="Hãng sản phẩm" name="brand">
              <Cascader
                options={brandOptions}
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
              />
            </Form.Item>

            <Form.Item label="Danh mục sản phẩm" name="category">
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
          Lưu
        </Button>
      </Form>
    </>
  );
};

export default AddProduct;
