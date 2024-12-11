import { Button, Form, Input, Upload } from "antd";
import React, { useEffect, useState } from "react";
const { TextArea } = Input;
import { InboxOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addNewProduct,
  getAdminProducts,
} from "../../../../services/productService";
import { Cascader } from "antd";
const { Dragger } = Upload;
const { SHOW_CHILD } = Cascader;
import defaultAvatar from "../../../../assets/download.png"; // Đường dẫn tới ảnh mặc định

const AddProduct = () => {
  const { productId } = useParams();
  const [avatar, setAvatar] = useState(null);

  const [form] = Form.useForm();
  console.log(productId);
  const categoryItem = useSelector((data) => data.category?.categories?.data);
  const brandCategory = useSelector((data) => data?.brand?.brands?.data);
  console.log(222, categoryItem);
  console.log(333, brandCategory);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const props = {
    name: "file",
    multiple: true,
    action: "/upload.do", // URL xử lý tải file lên
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

  const handleSubmit = (values) => {
    console.log("click");

    console.log("ne", values);

    const updateValues = {
      name: values?.productName,
      description: values?.description,
      files: avatar,
      price: values?.price,
      brandCategoryId: values?.brand[1],
      categoryItems: values?.category?.map((categorySub) => {
        return categorySub[1];
      }),
    };

    dispatch(addNewProduct(updateValues))
      .unwrap()
      .then((res) => {
        navigate("/products");

        console.log("res ne", res);
      });
  };

  const options = Array.isArray(categoryItem)
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

  const options2 = Array.isArray(brandCategory)
    ? brandCategory.map((brand) => ({
        label: brand?.name, // Giả sử 'name' là thuộc tính của brandCategory
        value: brand?.brandId,
        // Giả sử 'id' là thuộc tính của brandCategory
        children: Array.isArray(brand.brandCategories)
          ? brand.brandCategories.map((subBrand) => ({
              label: subBrand?.name, // Giả sử 'subCategory' có thuộc tính 'name'
              value: subBrand?.brandCategoryId, // Giả sử 'subCategory' có thuộc tính 'id'
            }))
          : [],
      }))
    : [];

  const onBrandChange = (value) => {
    console.log("dau", value[1]);
  };

  const onCategoryChange = (value) => {
    console.log(
      "son",
      value?.map((cac) => {
        return cac[1];
      })
    );
  };

  // Hàm filter để tùy chỉnh tìm kiếm
  const filter = (inputValue, path) => {
    return path.some((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Thêm flex để hai div nằm ngang nhau */}
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-5"> Chi tiết sản phẩm</h1>
          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
        </div>
        <div className="flex gap-x-28">
          <div className="w-1/2 pl-3">
            <Form.Item label="Tên sản phẩm" name="productName">
              <Input />
            </Form.Item>

            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea rows={4} placeholder="Mô tả ..." />
            </Form.Item>
            <Form.Item label="Hãng sản phẩm" className="flex-1" name="brand">
              <Cascader
                style={{
                  width: "100%",
                }}
                options={options2}
                onChange={onBrandChange}
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
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
                options={options}
                onChange={onCategoryChange}
                multiple
                maxTagCount="responsive"
                showCheckedStrategy={SHOW_CHILD}
                showSearch={{ filter }}
              />
            </Form.Item>
            <Form.Item label="Giá sản phẩm" name="price">
              <Input />
            </Form.Item>
          </div>

          <div className="w-1/6">
            <Form.Item label="Ảnh sản phẩm">
              <div>
                <Dragger {...props}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited
                    from uploading company data or other banned files.
                  </p>
                </Dragger>
              </div>
            </Form.Item>
          </div>
        </div>
      </Form>
    </>
  );
};

export default AddProduct;
