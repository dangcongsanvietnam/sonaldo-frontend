import { Button } from "antd";
import React from "react";

const DeleteAddressModal = ({ closeModal, openDeleteModal, loading }) => {
  return (
    <>
      <div className="flex flex-col gap-5">
        <div
          className="flex justify-between 
      "
        >
          <h1>Bạn có muốn xoá khum</h1>
        </div>
        <div className="flex justify-end pt-14 space-x-2">
          <Button className="w-[20%]" onClick={closeModal}>
            Trở lại
          </Button>
          <Button loading={loading} className="w-[20%]" type="primary" onClick={openDeleteModal}>
            Xoá
          </Button>
        </div>
      </div>
    </>
  );
};
export default DeleteAddressModal;
