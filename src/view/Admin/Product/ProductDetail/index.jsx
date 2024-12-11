import {
  Button,
  Cascader,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
const { TextArea } = Input;
import { InboxOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminProducts,
  getProductDetail,
  updateProduct,
} from "../../../../services/productService";
import defaultAvatar from "../../../../assets/download.png";
import ImageUpload from "../../../../components/ImageUpload";

const { Dragger } = Upload;
const { SHOW_CHILD } = Cascader;

const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();
  const [form] = Form.useForm();
  const productDetail = useSelector((data) => data?.product?.product?.data);
  const categoryItem = useSelector((data) => data.category?.categories?.data);
  const brandCategory = useSelector((data) => data?.brand?.brands?.data);

  console.log(1, productDetail);
  console.log(2, categoryItem);
  console.log(3, brandCategory);

  ///xu ly anh

  const productImg = productDetail?.images;
  const [fileList, setFileList] = useState([]);

  const [avatar, setAvatar] = useState(null);
  useEffect(() => {
    if (productImg && productImg.length > 0) {
      const newFileList = productImg.map((img, index) => {
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
  }, [productImg, fileList.length]);

  useEffect(() => {
    if (!avatar) {
      fetch(defaultAvatar)
        .then((res) => {
          console.log("ressss", res);
          res.blob();
        })
        .then((blob) => {
          const file = new File([blob], "default-avatar.png", {
            type: "image/png",
          });
          setAvatar(file);
        });
    }
  }, [avatar]);

  // const brandOptions = Array.isArray(brandCategory)
  //   ? brandCategory.flatMap((brand) =>
  //       Array.isArray(brand.brandCategories)
  //         ? brand.brandCategories.map((subBrand) => ({
  //             label: subBrand?.name,
  //             value: subBrand?.brandCategoryId,
  //           }))
  //         : []
  //     )
  //   : [];

  // const brandOptions = Array.isArray(brandCategory)
  //   ? brandCategory.map((brand) => ({
  //       label: brand?.name, // Giả sử 'name' là thuộc tính của brandCategory
  //       value: brand?.brandId,
  //       // Giả sử 'id' là thuộc tính của brandCategory
  //       children: Array.isArray(brand.brandCategories)
  //         ? brand.brandCategories.map((subBrand) => ({
  //             label: subBrand?.name, // Giả sử 'subCategory' có thuộc tính 'name'
  //             value: subBrand?.brandCategoryId, // Giả sử 'subCategory' có thuộc tính 'id'
  //           }))
  //         : [],
  //     }))
  //   : [];

  const brandOptions = Array.isArray(brandCategory)
    ? brandCategory.flatMap((brand) => ({
        label: brand?.name, // Tên của brandCategory
        value: brand?.brandId, // ID của brandCategory
        children: Array.isArray(brand.brandCategories)
          ? brand.brandCategories.map((subBrand) => ({
              label: subBrand?.name, // Tên của subBrand
              value: subBrand?.brandCategoryId, // ID của subBrand
            }))
          : [],
      }))
    : [];

  const categoryOptions = Array.isArray(categoryItem)
    ? categoryItem.map((category) => ({
        label: category?.name, // Giả sử 'name' là thuộc tính của categoryItem
        value: category?.categoryId,
        children: Array.isArray(category.categoryItems)
          ? category.categoryItems.map((subCategory) => ({
              label: subCategory?.name, // Giả sử 'subCategory' có thuộc tính 'name'
              value: subCategory?.categoryItemId, // Giả sử 'subCategory' có thuộc tính 'id'
            }))
          : [],
      }))
    : [];

  // console.log("first", categoryOptions[0].children?.map(()=>())
  // );

  const props = {
    name: "file",
    multiple: true,
    action: "/upload.do",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const [categoryDefault, setCategoryDefault] = useState([]);

  useEffect(() => {
    dispatch(getProductDetail(productId))
      .unwrap()
      .then((res) => {
        form.resetFields();
        console.log("xxon", res);
        // res.data.categoryItems?.map((item) =>
        //   setCategoryDefault((prev) => [
        //     ...prev,
        //     [item.categoryId, item.categoryItemId],
        //   ])
        // );

        const newCategories = res.data.categoryItems?.map((item) => [
          item.categoryId,
          item.categoryItemId,
        ]);

        // Chỉ gọi setCategoryDefault một lần sau khi đã có kết quả từ map
        setCategoryDefault(newCategories || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch, productId, form]);

  console.log("siuuuu", categoryDefault);

  const stateMapping = {
    1: "Out of stock",
    2: "In Stock",
    3: "Preorder",
  };

  const initialCategoryValues = Array.isArray(productDetail?.categoryItems)
    ? productDetail.categoryItems.map((item) => [
        item?.name, // Giả sử 'subCategory' có thuộc tính 'name'
        item?.categoryItemId, // Giả sử 'subCategory' có thuộc tính 'id'
      ])
    : [];

  console.log("ini", initialCategoryValues);
  // const initialBrandValues = productDetail?.brandCategory.

  const [tempValues, setTempValues] = useState({
    brand: null,
    category: null,
  });

  const handleFinish = (values) => {
    const sortedFileList = [...fileList].reverse();

    const updateValues = {
      name: values?.productName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      price: values?.price,
      brandCategoryId: tempValues.brand
        ? tempValues.brand[1]
        : productDetail?.brandCategory?.brandCategoryId,
      categoryItems: tempValues.category
        ? tempValues.category.map((subcategory) => subcategory[1])
        : productDetail?.categoryItems?.map((item) => item.categoryItemId),
      status: stateMapping[values.state] || values.state,
      quantity: values?.quantity,
    };
    console.log(555, values);
    console.log(666, updateValues);

    if (fileList.length < 1) {
      dispatch(getBrandDetail(brandId));
      notification.error({
        message: "Thất bại",
        description: "Bắt buộc phải có ít nhất 1 ảnh",
      });
    } else {
      dispatch(updateProduct({ updateValues, productId }))
        .unwrap()
        .then((res) => {
          dispatch(getProductDetail(productId));
          notification.success({
            description: "thành công",
            message: "Sửa sản phẩm thành công",
          });
        })
        .catch((err) => console.log(err));
    }
    // Xử lý gửi dữ liệu ở đây
  };

  useEffect(() => {
    if (productImg && productImg.length > 0) {
      const newFileList = productImg.map((img, index) => {
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
  }, [productImg, fileList.length]);

  const base64ToFile = (base64Data, filename) => {
    // Kiểm tra xem base64Data có phải là chuỗi base64 hợp lệ không
    if (!base64Data || !base64Data.startsWith("data:")) {
      console.warn("Invalid base64 data:", base64Data);
      // Nếu không có MIME type, giả định là `image/jpeg`
      const defaultMimeType = "image/jpeg";
      const arr = base64Data.split(",");
      const mime =
        arr.length > 1 ? arr[0].match(/:(.*?);/)[1] : defaultMimeType; // Lấy MIME type hoặc dùng loại mặc định
      const bstr = atob(arr[arr.length - 1]); // Giải mã base64 thành chuỗi nhị phân
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      // Chuyển đổi chuỗi nhị phân thành mảng Uint8Array
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      // Tạo đối tượng File từ mảng Uint8Array
      return new File([u8arr], filename, { type: mime });
    }

    try {
      // Tách phần MIME type và phần base64
      const arr = base64Data.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      // Chuyển đổi chuỗi nhị phân thành mảng Uint8Array
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      // Tạo đối tượng File từ mảng Uint8Array
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      return null;
    }
  };

  const handleValuesChange = (changedValues, allValues) => {
    const { quantity, state, brand, category } = changedValues;

    if (brand !== undefined) {
      setTempValues((prev) => ({ ...prev, brand }));
    }

    if (category !== undefined) {
      setTempValues((prev) => ({ ...prev, category }));
    }

    // Kiểm tra khi quantity thay đổi
    if (quantity !== undefined) {
      if (quantity > 0) {
        // Nếu quantity > 0 thì set state về "In Stock"
        form.setFieldsValue({ state: "2" }); // 2 là "In Stock"
      } else {
        // Nếu quantity = 0 thì set state về "Out of Stock"
        form.setFieldsValue({ state: "1" }); // 1 là "Out of Stock"
      }
    }

    // Kiểm tra khi state thay đổi
    if (state !== undefined) {
      if (state === "1" || state === "3") {
        // Nếu state là "Out of Stock" hoặc "Preorder", set quantity về 0
        form.setFieldsValue({ quantity: 0 });
      } else if (state === "2" && allValues.quantity === 0) {
        // Nếu state là "In Stock" nhưng quantity bằng 0, set quantity về 1
        form.setFieldsValue({ quantity: 1 });
      }
    }

    console.log("dcmm", brand[1], category);
  };

  const filter = (inputValue, path) => {
    return path.some((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  console.log(
    "vcl",
    productDetail
    // productDetail?.categoryItems.map((item) => item.categoryId),
    // productDetail?.categoryItems.map((item) => item.categoryItemId)
  );

  return (
    <>
      <h1 className="text-lg font-bold mb-5"> Chi tiết sản phẩm</h1>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          productName: productDetail?.name || "",
          description: productDetail?.description || "",
          // brand: productDetail?.brandCategory?.brandCategoryId || "",
          // category: initialCategoryValues || "",
          price: productDetail?.price || "",
          quantity: productDetail?.quantity || 0,
          state: productDetail?.state || "",
        }}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      >
        <Button type="primary" htmlType="submit">
          Lưu
        </Button>
        <div className="flex gap-x-28">
          <div className="w-1/2 pl-3">
            <Form.Item label="Tên sản phẩm" name="productName">
              <Input />
            </Form.Item>
            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea rows={4} placeholder="Mô tả ..." />
            </Form.Item>
            <div className="flex w-full gap-4">
              <Form.Item label="Hãng sản phẩm" className="flex-1" name="brand">
                <Cascader
                  style={{
                    width: "100%",
                  }}
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

              <Form.Item
                label="Danh mục sản phẩm"
                className="flex-1"
                name="category"
              >
                <Cascader
                  style={{
                    width: "100%",
                  }}
                  options={categoryOptions}
                  multiple
                  maxTagCount="responsive"
                  showCheckedStrategy={SHOW_CHILD}
                  showSearch={{ filter }}
                  defaultValue={categoryDefault}
                />
              </Form.Item>
            </div>
            <div className="flex w-full gap-4">
              <Form.Item label="Giá sản phẩm" className="flex-1" name="price">
                <InputNumber
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/₫\s?|(\.*)/g, "")}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item label="Số lượng" className="flex-1" name="quantity">
                <InputNumber min={1} max={100000} className="w-full" />
              </Form.Item>
              <Form.Item label="Trạng thái" className="flex-1" name="state">
                <Select
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: "1",
                      label: "Out of stock",
                    },
                    {
                      value: "2",
                      label: "In Stock",
                    },
                    {
                      value: "3",
                      label: "Preorder",
                    },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
          <div>
            <Form.Item label="Ảnh" name="files">
              <ImageUpload
                fileList={fileList}
                avatar={avatar}
                setAvatar={setAvatar}
                setFileList={setFileList}
              ></ImageUpload>
            </Form.Item>
          </div>
        </div>
      </Form>
    </>
  );
};

export default ProductDetail;
