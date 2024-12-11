import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminCategories,
  getCategoryDetail,
} from "../../../../services/categoryService";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Col, Row } from "antd";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const { categoryId } = useParams();
  console.log("ne", categoryId);

  useEffect(() => {
    dispatch(getAdminCategories());
    dispatch(getCategoryDetail(categoryId));
  }, [dispatch]);
  const navigate = useNavigate();
  const category = useSelector((state) => state?.category?.categories?.data);

  console.log(555, category);

  const handleClick = () => {
    navigate(`/public/category/${categoryId}`); // Điều hướng tới trang chi tiết của sản phẩm
  };

  return (
    <>
      <Row gutter={16} style={{ maxWidth: "100%", overflowX: "hidden" }}>
        {category?.map((item) => (
          <Col span={8} key={item.id}>
            <Card
              hoverable
              bordered={true}
              onClick={() => handleClick()}
              style={{
                width: "100%", // Điều chỉnh để Card chiếm hết không gian
                maxWidth: 240, // Đặt chiều rộng tối đa cho Card
              }}
              cover={
                <img
                  alt="example"
                  style={{ width: "100%", objectFit: "cover" }} // Đảm bảo hình ảnh không vượt quá giới hạn
                  src={`data:image/jpeg;base64,${item?.images[0].file.data}`}
                />
              }
            >
              {item.name}
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default CategoryPage;
