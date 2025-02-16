import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Button, Row, Col, notification, Spin, Modal } from "antd";
import ImgCrop from "antd-img-crop";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ImageUpload from "../../../../components/ImageUpload";
import {
  addNewCategoryItem,
  deleteCategoryItem,
  getCategoryDetail,
  updateCategory,
} from "../../../../services/categoryService";
import CategoryItemTable from "../../../../components/CategoryItemTable";
import { AddOutlined, DeleteOutline } from "@mui/icons-material";

const { TextArea, Search } = Input;

const CategoryDetail = () => {
  const [avatar, setAvatar] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [addCategoryItemData, setAddCategoryItemData] = useState({
    name: "",
    description: "",
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [categoryItemFileList, setCategoryItemFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const dispatch = useDispatch();
  const { categoryId } = useParams();
  const category = useSelector((state) => {
    return state?.category?.category?.data;
  });
  const categoryImage = category?.images;
  const [form] = Form.useForm();
  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        setLoading(true);
        await dispatch(getCategoryDetail(categoryId)).unwrap();
        form.resetFields();
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải chi tiết danh mục.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [dispatch, categoryId, form]);

  const handleSubmit = (values) => {
    const sortedFileList = [...fileList].reverse();
    const updateValues = {
      name: values?.categoryName,
      description: values?.description,
      files: sortedFileList.map((file) => file?.originFileObj),
      categoryId: categoryId,
    };

    if (fileList.length < 1) {
      notification.error({
        message: "Thất bại",
        description: "Bắt buộc phải có ít nhất 1 ảnh",
      });
      return;
    }

    setLoadingButton(true);
    dispatch(updateCategory(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getCategoryDetail(categoryId)).finally(() => setLoadingButton(false))
        notification.success({
          message: "Thành công",
          description: "Cập nhật thành công",
        });
      })
      .catch(() => {
        setLoadingButton(false)
        notification.error({
          message: "Thất bại",
          description: "Cập nhật thất bại",
        });
      })
  };


  useEffect(() => {
    if (categoryImage && categoryImage.length > 0) {
      const newFileList = categoryImage.map((img, index) => {
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
  }, [categoryImage, fileList.length]);

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

      // Tạo đối tượng File từ mảng Uint8Array
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      return null;
    }
  };

  const handleUpdateSelectedProducts = () => {
    setIsUpdateModalVisible(true);
  };

  const handleAddCategoryItem = () => {
    if (!addCategoryItemData.name || !addCategoryItemData.description) {
      notification.error({
        message: "Thất bại",
        description: "Vui lòng điền đầy đủ thông tin danh mục.",
      });
      return;
    }

    const updateValues = {
      name: addCategoryItemData.name,
      description: addCategoryItemData.description,
      files: categoryItemFileList.map((file) => file.originFileObj),
      categoryId: categoryId,
    };

    setLoading(true); // Bật loading
    dispatch(addNewCategoryItem(updateValues))
      .unwrap()
      .then(() => {
        dispatch(getCategoryDetail(categoryId)).finally(() => {
          setLoading(false); // Tắt loading
        });
        notification.success({
          message: "Thành công",
          description: "Thêm danh mục con thành công.",
        });
        setAddCategoryItemData({ name: "", description: "" });
        setCategoryItemFileList([]); // Reset danh sách file
        setIsUpdateModalVisible(false);
      })
      .catch(() => {
        notification.error({
          message: "Thất bại",
          description: "Thêm danh mục con thất bại.",
        });
      })
  };

  const handleDeleteSelectedProducts = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn không?",
      onOk: async () => {
        setLoading(true);
        try {
          for (const categoryItemId of selectedRowKeys) {
            await dispatch(deleteCategoryItem({ categoryId, categoryItemId })).unwrap();
          }
          notification.success({ message: "Xóa tất cả sản phẩm thành công" });
          setSelectedRowKeys([]); // Reset danh sách đã chọn
          dispatch(getCategoryDetail(categoryId)).finally(() => {
            setLoading(false);
          });
        } catch (error) {
          setLoading(false);
          notification.error({ message: "Xóa một số sản phẩm thất bại" });
          console.error("Lỗi khi xóa nhiều sản phẩm:", error);
        }
      },
    });
  };

  console.log(searchKeyword)

  return (
    <>
      <Spin spinning={loading}>
        <h1 className="text-lg mb-5"> Chi tiết danh mục sản phẩm </h1>
        <Form
          form={form}
          layout="vertical"
          style={{ margin: "0 auto" }}
          initialValues={{
            categoryName: category?.name || "",
            description: category?.description || "",
          }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên danh mục"
                name="categoryName"
                rules={[{ message: "Nhập danh mục ..." }]}
              >
                <Input initialValues={category?.name} />
              </Form.Item>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ message: "Nhập mô tả ..." }]}
              >
                <TextArea
                  rows={4}
                  placeholder=""
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ảnh" name="files">
                <ImageUpload
                  fileList={fileList}
                  setAvatar={setAvatar}
                  setFileList={setFileList}
                ></ImageUpload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="flex justify-end">
            <Button htmlType="submit" type="primary" loading={loadingButton}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
        {/* New Content Row */}
        <hr />
        <div className="mt-7">
          <Modal
            title="Thêm danh mục con"
            visible={isUpdateModalVisible}
            onOk={handleAddCategoryItem}
            onCancel={() => setIsUpdateModalVisible(false)}
            okText="Thêm"
            cancelText="Hủy"
            confirmLoading={loading}
          >
            <Form layout="vertical">
              <Form.Item
                label="Tên danh mục con"
                required
                rules={[{ required: true, message: "Nhập tên danh mục con!" }]}
              >
                <Input
                  value={addCategoryItemData.name}
                  onChange={(e) =>
                    setAddCategoryItemData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label="Mô tả"
                rules={[{ required: true, message: "Nhập mô tả!" }]}
              >
                <TextArea
                  rows={3}
                  value={addCategoryItemData.description}
                  onChange={(e) =>
                    setAddCategoryItemData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Ảnh sản phẩm">
                <ImageUpload
                  fileList={categoryItemFileList}
                  setFileList={setCategoryItemFileList}
                  setAvatar={setAvatar}
                />
              </Form.Item>
            </Form>
          </Modal>
          <div className="flex justify-between">
            <h1 className="text-lg mb-5">Danh mục nhãn hàng</h1>
            <div className="grid-cols-3 gap-x-3 grid">
              <Button
                type="primary"
                icon={<AddOutlined />}
                onClick={handleUpdateSelectedProducts}
              >
                Thêm danh mục con
              </Button>
              <Button
                type="primary"
                icon={<DeleteOutline />}
                danger
                onClick={handleDeleteSelectedProducts}
                disabled={selectedRowKeys.length === 0} // Chỉ bật khi có sản phẩm được chọn
              >
                Xóa sản phẩm đã chọn
              </Button>
              <Search
                placeholder="Nhập ID, tên danh mục con"
                onSearch={(value) => setSearchKeyword(value)}
                className="w-auto"
                enterButton
              />
            </div>
          </div>
          <CategoryItemTable
            categoryId={categoryId}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            searchKeyword={searchKeyword}
          ></CategoryItemTable>
        </div>
      </Spin>
    </>
  );
};

export default CategoryDetail;
