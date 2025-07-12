import { Link, useParams } from "react-router-dom";
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { useGetOrderDetailsQuery } from "../slices/ordersApiSlice";
import { useUpdateOrderStateMutation } from "../slices/ordersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const { userInfo } = useSelector((state) => state.auth);

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

  const [selectedState, setSelectedState] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });

  const [updateOrderState, { isLoading: loadingState }] =
    useUpdateOrderStateMutation();

  const updateStateHandler = async () => {
    if (!selectedState) return;

    try {
      await updateOrderState({
        orderId: order.cart_id,
        state: selectedState,
      }).unwrap();

      refetch(); // Refresh order details

      setToast({
        show: true,
        message: `Order state updated to "${selectedState}"`,
        //variant: selectedState === "delivered" ? "success" : "danger",
        variant:"success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Failed to update order state.",
        variant: "danger",
      });
    }
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger" />
  ) : (
    <>
      <h1>Order {order.cart_id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name:</strong> {order.user_name}
              </p>
              <p>
                <strong>Email:</strong> {order.user_email}
              </p>
              <p>
                <strong>Address: </strong>
                {JSON.parse(order.shipping_address)?.address},
                {JSON.parse(order.shipping_address)?.city},
                {JSON.parse(order.shipping_address)?.postalCode},
                {JSON.parse(order.shipping_address)?.country}
              </p>
              <p>
                <strong>Created at: </strong> {order.created_at}
              </p>
              <p>
                <strong>State: </strong>
                <span
                  className={`badge bg-${stateColor[order.state_name] || "dark"}`}
                >
                  {order.state_name}
                </span>
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.payment_method}
              </p>
              {order.coupon_code && (
                <p>
                  <strong>Coupon Used:</strong> {order.coupon_code}
                </p>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              {order.items.map((item, index) => (
                <ListGroup.Item key={index}>
                  <Row>
                    <Col md={1}>
                      <Image
                        src={item.photo_url}
                        alt={item.title}
                        fluid
                        rounded
                      />
                    </Col>

                    <Col>
                      <Link to={`/product/${item.book_id}`}>{item.title}</Link>
                    </Col>

                    <Col md={4}>
                      {item.quantity} X ${item.price} = $
                      {item.quantity * item.price}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Total Price</Col>
                  <Col>${order.total_price}</Col>
                </Row>
              </ListGroup.Item>

              {/* PAY ORDER PLACEHOLDER */}
              {userInfo && userInfo.isAdmin && (
                <ListGroup.Item>
                  <h2>Manage Order State</h2>
                  <Form.Group controlId="orderState">
                    <Form.Label>Select New State</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">-- Select State --</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Button
                    className="mt-3"
                    variant="primary"
                    disabled={!selectedState || loadingState}
                    onClick={updateStateHandler}
                  >
                    {loadingState ? "Updating..." : "Update State"}
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          bg={toast.variant}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default OrderScreen;
