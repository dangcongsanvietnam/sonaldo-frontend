import React, { useEffect, useState } from "react";
import {
  Button,
  Cascader,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  notification,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getProductDetail,
  updateProduct,
} from "../../../../services/productService";
import defaultAvatar from "../../../../assets/download.png";
import ImageUpload from "../../../../components/ImageUpload";
import { suggestTagsFromText } from "../../../../utils/suggestTagsFromText";

const { TextArea } = Input;
const { SHOW_CHILD } = Cascader;

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [categoryDefault, setCategoryDefault] = useState([]);
  const [tempValues, setTempValues] = useState({ brand: null, category: null });
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputConfirmed, setInputConfirmed] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);

  const productDetail = useSelector((state) => state?.product?.product?.data);
  const categoryItem = useSelector((state) => state?.category?.categories?.data);
  const brandCategory = useSelector((state) => state?.brand?.brands?.data);

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

  useEffect(() => {
    dispatch(getProductDetail(productId))
      .unwrap()
      .then((res) => {
        form.resetFields();
        const newCategories = res.data.categoryItems?.map((item) => [
          item.categoryId,
          item.categoryItemId,
        ]);
        setCategoryDefault(newCategories || []);
        const filteredTags = res.data.tags
          ?.map((tag) => `#${tag.tagName}`)
          .filter((tag) => tag.trim() !== "#");
        setTags(filteredTags || []);
      })
      .catch((err) => console.error(err));
  }, [dispatch, productId, form]);


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

  useEffect(() => {
    if (productDetail?.images && productDetail?.images.length > 0) {
      const newFileList = productDetail?.images.map((img, index) => {
        const file = base64ToFile(img.file.data, `image${index + 1}.jpg`);
        return {
          uid: index.toString(),
          name: file.name,
          status: "done",
          originFileObj: file,
        };
      });
      if (fileList.length === 0) {
        setFileList(newFileList);
      }
    }
  }, [productDetail?.images, fileList.length]);

  const base64ToFile = (base64Data, filename) => {
    if (!base64Data || !base64Data.startsWith("data:")) {
      console.warn("Invalid base64 data:", base64Data);
      const defaultMimeType = "image/jpeg";
      const arr = base64Data.split(",");
      const mime =
        arr.length > 1 ? arr[0].match(/:(.*?);/)[1] : defaultMimeType;
      const bstr = atob(arr[arr.length - 1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      return new File([u8arr], filename, { type: mime });
    }

    try {
      const arr = base64Data.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      return null;
    }
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


  const handleFinish = (values) => {
    const filteredTags = tags
      .filter((tag) => tag.trim() !== "") // Loại bỏ tag rỗng
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag.trim()}`));
    const stateMapping = {
      1: "Out of stock",
      2: "In Stock",
      3: "Preorder",
    };
    const updateValues = {
      name: values?.productName,
      description: values?.description,
      files: fileList.map((file) => file?.originFileObj),
      price: values?.price,
      brandCategoryId: tempValues.brand
        ? tempValues.brand[1]
        : productDetail?.brandCategory?.brandCategoryId,
      categoryItems: tempValues.category
        ? tempValues.category.map((subcategory) => subcategory[1])
        : productDetail?.categoryItems?.map((item) => item.categoryItemId),
      status: stateMapping[values.state] || values.state,
      quantity: values?.quantity,
      tagsDescription: filteredTags.join(" "),
    };

    if (fileList.length < 1) {
      notification.error({
        message: "Thất bại",
        description: "Bắt buộc phải có ít nhất 1 ảnh",
      });
      return;
    }

    setIsSaving(true);
    dispatch(updateProduct({ updateValues, productId }))
      .unwrap()
      .then(() => {
        notification.success({
          message: "Thành công",
          description: "Sửa sản phẩm thành công",
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setIsSaving(false));
  };

  const handleValuesChange = (changedValues, allValues) => {
    const { quantity, state, brand, category } = changedValues;

    if (brand !== undefined) setTempValues((prev) => ({ ...prev, brand }));
    if (category !== undefined) setTempValues((prev) => ({ ...prev, category }));

    if (quantity !== undefined) {
      form.setFieldsValue({
        state: quantity > 0 ? "2" : "1",
      });
    }

    if (state !== undefined) {
      if (state === "1" || state === "3") {
        form.setFieldsValue({ quantity: 0 });
      } else if (state === "2" && allValues.quantity === 0) {
        form.setFieldsValue({ quantity: 1 });
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputConfirmed) return; // Ngăn chặn gọi hàm lặp lại
    setInputConfirmed(true);

    const sanitizedInput = inputValue.trim();
    if (sanitizedInput && !tags.includes(sanitizedInput)) {
      if (sanitizedInput.startsWith("#")) {
        setTags((prevTags) => [...prevTags, sanitizedInput]);
        setInputValue("");
      } else {
        notification.error({
          message: "Lỗi",
          description: "Tag phải bắt đầu với ký tự #",
        });
      }
    } else if (!sanitizedInput) {
      setInputValue("");
    }

    setTimeout(() => setInputConfirmed(false), 100); // Đặt lại cờ sau khi xử lý
  };

  const handleAddTag = () => {
    handleInputConfirm();
  };

  const handleTagClose = (removedTag) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== removedTag));
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      handleInputConfirm();
    }
  };

  const handlePressEnter = (e) => {
    e.preventDefault();
    handleInputConfirm();
  };


  const filter = (inputValue, path) =>
    path.some((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

  return (
    <>
      <h1 className="text-lg font-bold mb-5">Chi tiết sản phẩm</h1>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          productName: productDetail?.name || "",
          description: productDetail?.description || "",
          price: productDetail?.price || "",
          quantity: productDetail?.quantity || 0,
          state: productDetail?.state || "",
        }}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      >
        <div className="flex gap-x-28">
          <div className="w-1/2 pl-3">
            <Form.Item label="Tên sản phẩm" name="productName">
              <Input onBlur={() => handleTagBlur()} />
            </Form.Item>

            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea onBlur={() => handleTagBlur()} rows={4} placeholder="Mô tả ..." />
            </Form.Item>

            <div className="mb-5">
              <div className="tags-container">
                <div className="mb-1">Tag sản phẩm</div>
                {tags.map((tag, index) => (
                  <Tag
                    key={`${tag}-${index}`}
                    closable
                    onClose={() => handleTagClose(tag)}
                    style={{ marginBottom: '8px' }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onPressEnter={handlePressEnter}
                  onBlur={handleBlur}
                  placeholder="Nhập tag (bắt đầu bằng #)"
                  style={{ width: '200px', marginBottom: '8px' }}
                />
                <Button type="primary" onClick={handleAddTag}>
                  Thêm tag
                </Button>
              </div>
              {suggestedTags.length > 0 && (
                <div className="mt-4">
                  <div className="suggested-tags">
                    <small className="mr-2">Gợi ý tag:</small>
                    {suggestedTags.slice(0, 5).map((tag) => (
                      <Tag
                        key={tag}
                        color="blue"
                        onClick={() => {
                          if (!tags.includes(tag)) {
                            setTags((prevTags) => [...prevTags, tag]);
                          }
                        }}
                        style={{ cursor: 'pointer', marginBottom: '8px' }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full gap-4">
              <Form.Item label="Giá sản phẩm" className="flex-1" name="price">
                <InputNumber
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/₫\s?|\D/g, "")}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item label="Số lượng" className="flex-1" name="quantity">
                <InputNumber min={1} max={100000} className="w-full" />
              </Form.Item>

              <Form.Item label="Trạng thái" className="flex-1" name="state">
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

          <div>
            <Form.Item label="Ảnh" name="files">
              <ImageUpload
                fileList={fileList}
                setAvatar={setAvatar}
                setFileList={setFileList}
              />
            </Form.Item>

            <Form.Item label="Hãng sản phẩm" name="brand">
              <Cascader
                options={brandOptions}
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
                defaultValue={[
                  productDetail?.brandCategory?.brandId,
                  productDetail?.brandCategory?.brandCategoryId,
                ]}
              />
            </Form.Item>

            <Form.Item label="Danh mục sản phẩm" name="category">
              <Cascader
                options={categoryOptions}
                multiple
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
                defaultValue={categoryDefault}
              />
            </Form.Item>
          </div>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          loading={isSaving}
          className="mt-5"
        >
          Lưu
        </Button>

      </Form>
    </>
  );
};

export default ProductDetail;
