import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Col, Row, Form, Tag } from "antd";
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
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";

const Address = () => {
  const addresses = useSelector((state) => state?.address?.data);
  const userAddress = addresses ?
    addresses
      .slice()
      .sort((a, b) => {
        if (a.defaultAddress === b.defaultAddress) {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return b.defaultAddress - a.defaultAddress;
      }) : []

  const initialState = {
    fullName: "",
    phoneNumber: "",
    address: "",
    province: "",
    district: "",
    commune: "",
    defaultAddress: userAddress.length === 0,
  };
  const editInitialState = { ...initialState, id: "" };
  const token = Cookies.get("token");
  const [addressId, setAddressId] = useState();
  const [address, setAddress] = useState(initialState);
  const [isDefault, setIsDefault] = useState(true);
  const [isCreateModal, setIsCreateModal] = useState(true);
  const [editAddress, setEditAddress] = useState(editInitialState);
  const { vnMode } = useOutletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
        if (token) {
          dispatch(getAddress(token));
        }
        setEditAddress(editInitialState);
        setIsModalEditOpen(false);
        form.setFieldsValue(editInitialState);
        setLoading(false);
      })
      .catch(() => {
        toast.error(vnMode ? "Thất bại" : "Failed");
        setLoading(false);
      });
  };

  const handleDeleteOk = () => {
    dispatch(deleteAddress(addressId))
      .unwrap()
      .then(() => {
        if (token) {
          dispatch(getAddress(token));
        }
        setIsModalDeleteOpen(false);
        setLoading(false);
      })
      .catch(() => {
        toast.error(vnMode ? "Thất bại" : "Failed");
        setLoading(false);
      });
  };

  const handleOk = () => {
    setLoading(true);
    dispatch(addAddress(address))
      .unwrap()
      .then(() => {
        setAddress(initialState);
        if (token) {
          dispatch(getAddress(token));
        }
        form.setFieldsValue(editInitialState);
        setLoading(false);
        setIsModalOpen(false);
      })
      .catch(() => {
        toast.error(vnMode ? "Thất bại" : "Failed");
        setLoading(false);
      });
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
        title={vnMode ? "Địa chỉ mới" : "New Address"}
        open={isModalOpen}
        closable={false}
        footer={null}
        zIndex={10000}
      >
        <CreateAddressModal
          form={form}
          closeModal={handleCancel}
          setAddress={setAddress}
          openModal={handleOk}
          editAddress={address}
          isCreateModal={isCreateModal}
          loading={loading}
          vnMode={vnMode}
        />
      </Modal>

      <Modal open={isModalDeleteOpen} closable={false} footer={null} zIndex={10000}>
        <DeleteAddressModal
          closeModal={handleCancel}
          openDeleteModal={handleDeleteOk}
          loading={loading}
          vnMode={vnMode}
        />
      </Modal>

      <Modal
        title={vnMode ? "Cập nhật địa chỉ" : "Update Address"}
        open={isModalEditOpen}
        closable={false}
        footer={null}
        zIndex={10000}
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
          loading={loading}
          vnMode={vnMode}
        />
      </Modal>

      <div className="flex justify-between">
        <div className="font-bold text-2xl mb-5">{vnMode ? "Địa chỉ" : "Address"}</div>
      </div>
      <div className="pt-1">
        <Row gutter={16}>
          {userAddress && userAddress.length > 0 ? (
            userAddress.map((item, index) => (
              <Col span={24} key={index} style={{ marginBottom: "16px" }}>
                <Card style={{ width: "100%" }}>
                  <div className="space-x-2 flex">
                    <p>
                      <strong>Tên:</strong> {item.fullName}
                    </p>
                    {item.defaultAddress ? (<Tag color="green">{vnMode ? "Mặc định" : "Default"}</Tag>) : ""}
                  </div>
                  <p>
                    <strong>{vnMode ? "Số điện thoại:" : "Phone Number:"}</strong> {item.phoneNumber}
                  </p>
                  <p>
                    <strong>{vnMode ? "Địa chỉ:" : "Address:"}</strong> {item.address}
                  </p>
                  <p>
                    {item.province},{item.district},{item.commune}
                  </p>
                  <div className="space-x-2">
                    {item.defaultAddress ? (
                      ""
                    ) : (
                      <Button
                        danger
                        onClick={() => {
                          handleDelete(item.addressId);
                        }}
                      >
                        {vnMode ? "Xoá" : "Delete"}
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        handleEdit(item);
                      }}
                    >
                      {vnMode ? "Sửa" : "Edit"}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <></>
          )}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Button
              type="primary"
              onClick={showModal}
              className="h-[40px] w-full !rounded-md py-10 bg-white text-black"
            >
              <PlusOutlined className="text-4xl" /> <span className="text-lg">{vnMode ? "Thêm địa chỉ" : "Add Address"}</span>
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Address;
