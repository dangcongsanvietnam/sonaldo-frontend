import { Button } from "antd";
import React from "react";

const DeleteAddressModal = ({ closeModal, openDeleteModal, loading, vnMode }) => {
  return (
    <>
      <div className="flex flex-col gap-5">
        <div
          className="flex justify-between 
      "
        >
          <h1>{vnMode ? "Bạn có muốn xoá không?" : "Are you sure want to delete?"}</h1>
        </div>
        <div className="flex justify-end pt-14 space-x-2">
          <Button className="w-[20%]" onClick={closeModal}>
            {vnMode ? "Trở lại" : "Back"}
          </Button>
          <Button loading={loading} className="w-[20%]" type="primary" onClick={openDeleteModal}>
            {vnMode ? "Xoá" : "Delete"}
          </Button>
        </div>
      </div>
    </>
  );
};
export default DeleteAddressModal;
