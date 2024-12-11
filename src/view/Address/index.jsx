import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Col, Row, notification, Form } from "antd";
import CreateAddressModal from "../../components/Modal/CreateAddressModal";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import {
  addAddress,
  deleteAddress,
  getAddress,
  updateAddress,
} from "../../services/addressService";
import DeleteAddressModal from "../../components/Modal/DeleteAddressModal";
import EditAddressModal from "../../components/Modal/EditAddressModal";

const initialState = {
  fullName: "",
  phoneNumber: "",
  address: "",
  province: "",
  district: "",
  commune: "",
  defaultAddress: false,
};

const Address = () => {
  const editInitialState = { ...initialState, id: "" };
  const token = Cookies.get("token");
  const [addressId, setAddressId] = useState();
  const [address, setAddress] = useState(initialState);
  const [isDefault, setIsDefault] = useState(true);
  const [isCreateModal, setIsCreateModal] = useState(true);
  const [editAddress, setEditAddress] = useState(editInitialState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
    setIsCreateModal(true);
  };

  const handleEditOk = () => {
    dispatch(updateAddress(editAddress))
      .unwrap()
      .then(() => {
        notification.success({
          message: "Thành công",
          description: "Sửa địa chỉ thành công",
        });

        if (token) {
          dispatch(getAddress(token));
        }
        setEditAddress(editInitialState);
        setIsModalEditOpen(false);
        form.setFieldsValue(editInitialState);
      })
      .catch(() => {
        notification.error({
          message: "Thất bại",
          description: "Sửa địa chỉ thất bại",
        });
      });
  };

  const handleDeleteOk = () => {
    dispatch(deleteAddress(addressId))
      .unwrap()
      .then(() => {
        notification.success({
          message: "Thành công",
          description: "Xoá địa chỉ thành công",
        });

        if (token) {
          dispatch(getAddress(token));
        }

        setIsModalDeleteOpen(false);
      })
      .catch(() => {
        notification.error({
          message: "Thất bại",
          description: "Xoá địa chỉ thất bại",
        });
      });
  };

  const handleOk = () => {
    setIsModalOpen(false);
    dispatch(addAddress(address))
      .unwrap()
      .then(() => {
        setAddress(initialState);
        notification.success({
          message: "Thành công",
          description: "Thêm địa chỉ thành công",
        });
        if (token) {
          dispatch(getAddress(token));
        }
        form.setFieldsValue(editInitialState);
      })
      .catch(() =>
        notification.error({
          message: "Thất bại",
          description: "Thêm địa chỉ thất bại",
        })
      );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalDeleteOpen(false);
    setIsModalEditOpen(false);
    form.setFieldsValue(editInitialState);
  };

  useEffect(() => {
    if (token) {
      dispatch(getAddress(token));
    }
  }, [dispatch]);

  const userAddress = useSelector((state) => state?.address?.data);
  const handleDelete = (itemId) => {
    setIsModalDeleteOpen(true);
    setAddressId(itemId);
  };

  const handleEdit = (item) => {
    setIsModalEditOpen(true);
    setEditAddress(item);
    setIsDefault(item.defaultAddress);
    form.setFieldsValue(item);
    setIsCreateModal(false);
  };

  return (
    <>
      <Modal
        title="Địa chỉ mới"
        open={isModalOpen}
        closable={false}
        footer={null}
      >
        <CreateAddressModal
          form={form}
          closeModal={handleCancel}
          setAddress={setAddress}
          openModal={handleOk}
          editAddress={address}
          isCreateModal={isCreateModal}
        />
      </Modal>

      <Modal open={isModalDeleteOpen} closable={false} footer={null}>
        <DeleteAddressModal
          closeModal={handleCancel}
          openDeleteModal={handleDeleteOk}
        />
      </Modal>

      <Modal
        title="Cập nhật địa chỉ"
        open={isModalEditOpen}
        closable={false}
        footer={null}
      >
        <EditAddressModal
          form={form}
          editInitialState={editInitialState}
          isDefault={isDefault}
          closeModal={handleCancel}
          setEditAddress={setEditAddress}
          openEditModal={handleEditOk}
          editAddress={editAddress}
          isCreateModal={isCreateModal}
        />
      </Modal>

      <div className="flex justify-between border-b">
        <div className="uppercase">Địa chỉ của tôi</div>
        <div className="pb-2">
          <Button
            type="primary"
            onClick={showModal}
            className="h-[40px] rounded-none"
          >
            Thêm địa chỉ mới
          </Button>
        </div>
      </div>
      <div className="pt-1">
        <Row gutter={16}>
          {userAddress && userAddress.length > 0 ? (
            userAddress.map((item, index) => (
              <Col span={24} key={index} style={{ marginBottom: "16px" }}>
                <Card style={{ width: "100%" }}>
                  <p>
                    <strong>Tên:</strong> {item.fullName}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {item.phoneNumber}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {item.address}
                  </p>
                  <p>
                    {item.province},{item.district},{item.commune}
                  </p>
                  <p>{item.defaultAddress ? "Mặc đinh" : ""}</p>
                  {item.defaultAddress ? (
                    ""
                  ) : (
                    <Button
                      onClick={() => {
                        handleDelete(item.id);
                      }}
                    >
                      Xoá
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      console.log("sua", item);
                      handleEdit(item);
                    }}
                  >
                    Sửa
                  </Button>
                </Card>
              </Col>
            ))
          ) : (
            <p>Không có địa chỉ nào.</p>
          )}
        </Row>
      </div>
    </>
  );
};

export default Address;
