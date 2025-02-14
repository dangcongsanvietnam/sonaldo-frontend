import React from "react";
import BrandForm from "../../../../components/Form/BrandForm";
import { useOutletContext } from "react-router-dom";

const Addbrand = () => {
  const {vnMode} = useOutletContext();
  return (
    <div>
      <div>
        <BrandForm vnMode={vnMode} />
      </div>
    </div>
  );
};

export default Addbrand;
