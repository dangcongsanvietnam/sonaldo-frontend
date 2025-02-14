import React from "react";
import CategoryForm from "../../../../components/Form/CategoryForm";
import { useOutletContext } from "react-router-dom";

const AddCategory = () => {
  const {vnMode} = useOutletContext();
  return (
    <div>
      <div>
        <CategoryForm vnMode={vnMode}></CategoryForm>
      </div>
    </div>
  );
};

export default AddCategory;
