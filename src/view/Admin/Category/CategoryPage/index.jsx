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

  useEffect(() => {
    dispatch(getAdminCategories());
    dispatch(getCategoryDetail(categoryId));
  }, [dispatch, categoryId]);

  const navigate = useNavigate();
  const category = useSelector((state) => state?.category?.categories?.data);

  const handleClick = (id) => {
    navigate(`/category/${id}`); // Điều hướng tới trang chi tiết của sản phẩm
  };

  return (
    <div className="p-4 text-center">
      {/* Bọc bằng div */}
      <Row
        gutter={[24, 24]} // Khoảng cách giữa các Card
        justify="center" // Canh giữa nội dung trong Row
        wrap // Đảm bảo các item không bị tràn ra ngoài khi không gian hạn chế
        className="overflow-hidden" // Ngăn chặn thanh scroll ngang
      >
        {category?.map((item) => (
          <Col
            key={item.id}
            xs={24} // Màn hình nhỏ: 1 Card mỗi hàng
            sm={12} // Màn hình vừa: 2 Card mỗi hàng
            md={8} // Màn hình lớn: 3 Card mỗi hàng
            className="flex justify-center" // Căn giữa Card trong cột
          >
            <Card
              hoverable
              bordered
              onClick={() => handleClick(item.categoryId)}
              className="w-60 text-center" // Chiều rộng cố định cho Card và canh giữa nội dung trong Card
              cover={
                <img
                  alt={item.categoryName}
                  className="h-36 object-cover" // Ảnh đẹp và vừa khung
                  src={`data:image/jpeg;base64,${item?.imageFile?.file?.data}`}
                />
              }
            >
              <div className="font-bold">{item.categoryName}</div>
              <div className="text-gray-500">
                {item.categoryItems?.length} Category items
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategoryPage;
