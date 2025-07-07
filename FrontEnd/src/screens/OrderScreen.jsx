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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const OrderScreen = () => {
  const { id: orderId } = useParams();

  

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  console.log(order);

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
                <strong>Name:</strong> {order.user.name}
              </p>
              <p>
                <strong>Email:</strong> {order.user.email}
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
                {["unpaid", "notDelivered"].includes(order.state) ? (
                  <Message variant="danger">{order.state}</Message>
                ) : (
                  <Message variant="success">{order.state}</Message>
                )}
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
                {order.items.map((item,index) =>(
                    <ListGroup.Item key={index}>
                        <Row>
                            <Col md={1}>
                                <Image src={item.photo_url} alt = {item.title} fluid rounded/>
                            </Col>

                            <Col>
                               <Link to={`/product/${item.book_id}`}>
                                    {item.title}
                               </Link>
                            </Col>

                            <Col md={4}>
                                {item.quantity} X ${item.price} = ${item.quantity*item.price}
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
                    {/* MARK AS DELIVERED PLACEHOLDER */}
                </ListGroup>
            </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
