import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminCategories,
  getCategoryDetail,
} from "../../../../services/categoryService";
import { useParams } from "react-router-dom";
import { Card, Col, Row } from "antd";

const CategoryPageDetail = () => {
  const dispatch = useDispatch();
  const categoryId = useParams();

  useEffect(() => {
    dispatch(getAdminCategories());
    dispatch(getCategoryDetail(categoryId));
  }, [dispatch]);

  const category = useSelector((state) => state?.category?.categories?.data);

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

export default CategoryPageDetail;
