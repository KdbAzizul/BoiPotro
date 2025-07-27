import { Row, Col, Button, ListGroup, Table, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useState, useMemo } from "react";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: orders,
    isLoading: loadingOrders,
    error: errorOrders,
  } = useGetMyOrdersQuery();

  // Filter orders based on status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "all") return orders;
    return orders.filter(order => order.state_name === statusFilter);
  }, [orders, statusFilter]);

  const updateHandler = () => {
    navigate("/profile/edit");
  };

  const stateOptions = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  const stateColor = {
    pending: "warning",
    processing: "primary",
    shipped: "info",
    delivered: "success",
    cancelled: "danger",
    returned: "secondary",
  };

  return (
    <Row>
      <Col md={4}>
        <h2>Profile Information</h2>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Name:</strong> {userInfo?.name}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Email:</strong> {userInfo?.email}
          </ListGroup.Item>
          <ListGroup.Item>
            <Button variant="primary" onClick={updateHandler}>
              Update Profile
            </Button>
          </ListGroup.Item>
        </ListGroup>
      </Col>

      <Col md={8}>
        <h3 className="mt-3">My Orders</h3>
        
        {/* Order Status Filter */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {loadingOrders ? (
          <Loader />
        ) : errorOrders ? (
          <Message variant="danger">
            {errorOrders?.data?.message || "Error loading orders"}
          </Message>
        ) : filteredOrders.length === 0 ? (
          <Message>No orders found with the selected status</Message>
        ) : (
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Coupon</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.cart_id}>
                  <td>{order.cart_id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    {/* <span
                      className={`badge bg-${
                        ["delivered", "completed"].includes(order.state_id)
                          ? "success"
                          : "warning"
                      }`}
                    >
                      {order.state_name}
                    </span> */}

                    <p>
                      <strong>State: </strong>
                      <span
                        className={`badge bg-${
                          stateColor[order.state_name] || "dark"
                        }`}
                      >
                        {order.state_name}
                      </span>
                    </p>
                  </td>
                  <td>{order.total_item}</td>
                  <td>${order.total_price}</td>
                  <td>{order.payment_method || "Unpaid"}</td>
                  <td>{order.coupon_code || "-"}</td>
                  <td>
                    <Link to={`/order/${order.cart_id}`}>
                      <Button variant="light" size="sm">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
