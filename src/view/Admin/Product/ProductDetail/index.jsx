import React, { useEffect, useState } from "react";
import {
  Button,
  Cascader,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Tooltip,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  getProductDetail,
  updateProduct,
} from "../../../../services/productService";
import defaultAvatar from "../../../../assets/download.png";
import ImageUpload from "../../../../components/ImageUpload";
import { suggestTagsFromText } from "../../../../utils/suggestTagsFromText";
import { toast } from "react-toastify";
import { getAdminBrands } from "../../../../services/brandService";
import { getAdminCategories } from "../../../../services/categoryService";
import { LeftOutlined } from '@ant-design/icons';
import { useLoading } from "../../../../provider/LoadingProvider";

const { TextArea } = Input;
const { SHOW_CHILD } = Cascader;

const ProductDetail = () => {
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
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
  const [formUpdated, setFormUpdated] = useState(false);
  const { vnMode } = useOutletContext();

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
    const fetchData = async () => {
      startLoading();
      await dispatch(getProductDetail(productId))
        .unwrap()
        .then((res) => {
          const newCategories = res.data.categoryItems?.map((item) => [
            item.categoryId,
            item.categoryItemId,
          ]);
          setCategoryDefault(newCategories || []);

          const filteredTags = res.data.tags
            ?.map((tag) => `#${tag.tagName}`)
            .filter((tag) => tag.trim() !== "#");
          setTags(filteredTags || []);

          form.resetFields();
          form.setFieldsValue({
            productName: res.data.name || "",
            description: res.data.description || "",
            price: res.data.price || "",
            quantity: res.data.quantity || 0,
            state: res.data?.state === "Preorder" ? "2" : res.data?.state === "Lock" ? "1" : res.data?.state === "NewArrival" ? "3" : "4" || "",
            brand: [
              res.data.brandCategory?.brandId,
              res.data.brandCategory?.brandCategoryId,
            ],
          })

          setTimeout(() => {
            setFormUpdated(true);
          }, 0);
        })
        .catch().finally(() => stopLoading())
    }
    fetchData();
  }, [dispatch, productId, form]);

  useEffect(() => {
    if (formUpdated) {
      handleTagBlur();
      setFormUpdated(false);
    }
  }, [formUpdated]);

  useEffect(() => {
    if (categoryDefault.length > 0) {
      form.setFieldsValue({ category: categoryDefault });
    }
  }, [categoryDefault, form]);


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
      return null;
    }
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


  const handleFinish = (values) => {
    const filteredTags = tags
      .filter((tag) => tag.trim() !== "") // Loại bỏ tag rỗng
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag.trim()}`));
    const stateMapping = {
      1: "Lock",
      2: "Preorder",
      3: "NewArrival",
      4: "Normal"
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
      toast.error(vnMode ? "Bắt buộc phải có ít nhất 1 ảnh" : "Require at least one picture");
      return;
    }

    setIsSaving(true);
    dispatch(updateProduct({ updateValues, productId }))
      .unwrap()
      .then(() => {
        toast.success(vnMode ? "Sửa sản phẩm thành công" : "Successfully updated product");
        dispatch(getProductDetail(productId))
          .unwrap()
          .then((res) => {
            console.log(res)
            const newCategories = res.data.categoryItems?.map((item) => [
              item.categoryId,
              item.categoryItemId,
            ]);
            setCategoryDefault(newCategories || []);

            const filteredTags = res.data.tags
              ?.map((tag) => `#${tag.tagName}`)
              .filter((tag) => tag.trim() !== "#");
            setTags(filteredTags || []);

            form.resetFields();
            form.setFieldsValue({
              productName: res.data.name || "",
              description: res.data.description || "",
              price: res.data.price || "",
              quantity: res.data.quantity || 0,
              state: res.data?.state === "Preorder" ? "2" : res.data?.state === "Lock" ? "1" : res.data?.state === "NewArrival" ? "3" : "4" || "",
              brand: [
                res.data.brandCategory?.brandId,
                res.data.brandCategory?.brandCategoryId,
              ],
            })

            setTimeout(() => {
              setFormUpdated(true);
            }, 0);
          })
          .catch();
      })
      .catch()
      .finally(() => setIsSaving(false));
  };

  const handleValuesChange = (changedValues, allValues) => {
    handleTagBlur(allValues);
    const { state, brand, category } = changedValues;

    if (brand !== undefined) setTempValues((prev) => ({ ...prev, brand }));
    if (category !== undefined) setTempValues((prev) => ({ ...prev, category }));

    if (state !== undefined) {
      if (state === "1" || state === "2") {
        form.setFieldsValue({ quantity: 0 });
      }
    }
  };

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
      <Tooltip title={vnMode ? 'Danh sách thương hiệu' : 'Brand list'}>
        <Button
          icon={<LeftOutlined className="text-blue-600" />}
          onClick={() => navigate('/admin/products')}
          shape="circle"
          size="small"
          className="bg-blue-100 hover:bg-blue-200 mb-10 mr-2"
        />
        {vnMode ? 'Danh sách sản phẩm' : 'Product list'}
      </Tooltip>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          productName: productDetail?.name || "",
          description: productDetail?.description || "",
          price: productDetail?.price || "",
          quantity: productDetail?.quantity || 0,
          state: productDetail?.state === "Preorder" ? "2" : productDetail?.state === "Lock" ? "1" : productDetail?.state === "NewArrival" ? "3" : "4" || "",
          brand: [
            productDetail?.brandCategory?.brandId,
            productDetail?.brandCategory?.brandCategoryId,
          ],
          category: categoryDefault
        }}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      >
        <div className="flex gap-x-28">
          <div className="w-1/2 pl-3">
            <Form.Item label={vnMode ? "Tên sản phẩm" : "Product name"} name="productName">
              <Input onBlur={() => handleTagBlur()} placeholder={vnMode ? "nhập tên ..." : "enter name ..."} />
            </Form.Item>

            <Form.Item label={vnMode ? "Mô tả sản phẩm" : "Product description"} name="description">
              <TextArea onBlur={() => handleTagBlur()} rows={4} placeholder={vnMode ? "Mô tả ..." : "Descibe ..."} />
            </Form.Item>

            <div className="mb-5">
              <div className="tags-container">
                <div className="mb-1">{vnMode ? "Nhãn sản phẩm" : "Product tag"}</div>
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
                  placeholder={vnMode ? "Nhập tag (bắt đầu bằng #)" : "Enter tag (Start with #)"}
                  style={{ width: '200px', marginBottom: '8px' }}
                />
                <Button type="primary" onClick={handleAddTag}>
                  {vnMode ? "Thêm nhãn" : "Add tag"}
                </Button>
              </div>
              {suggestedTags.length > 0 && (
                <div className="mt-4">
                  <div className="suggested-tags">
                    <small className="mr-2">{vnMode ? "Gợi ý nhãn:" : "Suggested tag:"}</small>
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
              <Form.Item label={vnMode ? "Giá sản phẩm" : "Product price"} className="flex-1" name="price">
                <InputNumber
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/₫\s?|\D/g, "")}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item label={vnMode ? "Số lượng" : "Quantity"} className="flex-1" name="quantity">
                <InputNumber min={0} max={100000} className="w-full" />
              </Form.Item>

              <Form.Item label={vnMode ? "Trạng thái" : "Product state"} className="flex-1" name="state">
                <Select
                  options={[
                    { value: "1", label: vnMode ? "Khoá" : "Lock" },
                    { value: "2", label: vnMode ? "Đặt trước" : "Preorder" },
                    { value: "3", label: vnMode ? "Sản phẩm mới" : "New Arrival" },
                    { value: "4", label: vnMode ? "Bình thường" : "Normal" },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          <div>
            <Form.Item label={vnMode ? "Ảnh sản phẩm" : "Product image"} name="files">
              <ImageUpload
                fileList={fileList}
                setAvatar={setAvatar}
                setFileList={setFileList}
              />
            </Form.Item>

            <Form.Item label={vnMode ? "Thương hiệu sản phẩm" : "Product brand"} name="brand">
              <Cascader
                options={brandOptions}
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
              />
            </Form.Item>

            <Form.Item label={vnMode ? "Danh mục sản phẩm" : "Product category"} name="category">
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

        <Button
          type="primary"
          htmlType="submit"
          loading={isSaving}
          className="mt-5"
        >
          {vnMode ? "Lưu sản phẩm" : "Save product"}
        </Button>

      </Form>
    </>
  );
};

export default ProductDetail;
