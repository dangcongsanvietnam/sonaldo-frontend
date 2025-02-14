import React, { useEffect, useState } from 'react';
import {
  Layout, List, Avatar, Space, Typography, Spin,
  Tooltip,
  Button,
  notification,
  Card,
  Row,
  Col,
  Tag,
  Steps,
  Divider,
} from 'antd';
import {
  LoadingOutlined, LeftOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { getOrderDetail } from '../../services/orderService';
import moment from 'moment';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderDetail, loading } = useSelector((state) => state.orders);
  const { orderId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { setLastViewedOrderId } = useOutletContext();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        await dispatch(getOrderDetail(orderId)).unwrap();
      } catch (error) {
        notification.error({ message: error?.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [dispatch, orderId]);

  useEffect(() => {
    if (orderId) {
      setLastViewedOrderId(orderId);
    }
  }, [orderId, setLastViewedOrderId]);

  return (
    <Content className="p-6">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      )}

      <Space className="mb-4">
        <Tooltip title="Quay lại danh sách đơn hàng">
          <Button
            icon={<LeftOutlined className="text-blue-600" />}
            onClick={() => navigate('/super-admin/orders')}
            shape="circle"
            size="small"
            className="bg-blue-100 hover:bg-blue-200"
          />
        </Tooltip>
        <span>Chi tiết đơn hàng</span>
      </Space>

      {orderDetail && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Timeline */}
          <div className="mb-6">
            <Steps current={orderDetail.orderStatus === 'COMPLETED' ? 2 : (orderDetail.orderStatus === 'FAILED' ? -1 : 1)} progressDot error={orderDetail.orderStatus === 'FAILED'}> {/* Thêm error prop */}
              <Step title="Đặt hàng" />
              <Step title="Đang giao" />
              <Step title="Hoàn thành" />
            </Steps>
          </div>

          <Row gutter={[16, 16]}>
            {/* Cột trái */}
            <Col xs={24} lg={12}>
              {/* Thông tin chung */}
              <div>
                <Title level={5}>Thông tin đơn hàng</Title>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Mã đơn hàng:</Text>
                    <Tag color="blue">{orderDetail.orderId}</Tag>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Tổng tiền:</Text>
                    <span>${orderDetail.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Trạng thái:</Text>
                    <span>
                      {orderDetail.orderStatus === 'PENDING' && <Tag color="orange">Chờ xử lý</Tag>}
                      {orderDetail.orderStatus === 'COMPLETED' && <Tag color="green">Hoàn thành</Tag>}
                      {orderDetail.orderStatus === 'FAILED' && <Tag color="red">Thất bại</Tag>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Phương thức thanh toán:</Text>
                    <span>{orderDetail.orderMethod}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin địa chỉ */}
              
            </Col>

            {/* Cột phải */}
            <Col xs={24} lg={12}>
              {/* Cart items */}
              <div>
                <Title level={5}>Thông tin địa chỉ</Title>
                <div className="mt-2">
                  <Text strong>Tên khách hàng:</Text> {orderDetail.fullName}
                  <br />
                  <Text strong>Số điện thoại:</Text> {orderDetail.phoneNumber}
                  <br />
                  <Text strong>Địa chỉ giao hàng:</Text> {orderDetail.shippingAddress}
                </div>
              </div>
              
            </Col>
          </Row>
          <Divider />
          <div className='mt-6'>
                <Title level={5}>Danh sách sản phẩm</Title>
                <List
                  itemLayout="vertical"
                  grid={{ gutter: 16, column: 2 }} // Hiển thị 2 card mỗi dòng
                  dataSource={orderDetail.cartItems}
                  renderItem={(item) => (
                    <List.Item key={item.cartItemId}>
                      <Card>
                        <Space direction="vertical" size="middle">
                          <Avatar shape="square" size={100} src={`data:image/jpeg;base64,${item.productImage.file.data}`} />
                          <div>
                            <Title level={5}>{item.productName}</Title>
                            <Text type="secondary">Quantity: {item.quantity}</Text>
                            <br />
                            <Text strong>${item.totalPrice.toFixed(2)}</Text>
                            <br />
                            <Text type="secondary">
                              Ngày thêm: {moment(item.createAt).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
        </div>
      )}
    </Content>
  );
};

export default OrderDetail;