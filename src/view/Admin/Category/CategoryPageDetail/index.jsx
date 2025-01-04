import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminCategories,
  getCategoryDetail,
} from "../../../../services/categoryService";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Col, Row } from "antd";

const CategoryPageDetail = () => {
  const dispatch = useDispatch();
  const categoryId = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAdminCategories());
    dispatch(getCategoryDetail(categoryId));
  }, [dispatch]);

  const category = useSelector((state) => state?.category?.categories?.data);
  console.log("category", category);

  return (
    <>
      <Row gutter={16} style={{ maxWidth: "100%", overflowX: "hidden" }}>
        {category?.map((item) => (
          <Col span={8} key={item.id}>
            <Card
              hoverable
              bordered={true}
              style={{
                width: "100%", // Điều chỉnh để Card chiếm hết không gian
                maxWidth: 240, // Đặt chiều rộng tối đa cho Card
              }}
              cover={
                <img
                  alt="example"
                  style={{ width: "100%", objectFit: "cover" }} // Đảm bảo hình ảnh không vượt quá giới hạn
                  src={`data:image/jpeg;base64,${item.imageFile?.file?.data}`}
                />
              }
            >
              {item?.categoryName}
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default CategoryPageDetail;
