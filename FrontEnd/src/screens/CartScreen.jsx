import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import Message from "../components/Message";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
} from "../slices/cartApiSlice";
import QuantitySelector from "../components/QuantitySelector";

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //const { data: cartItems = [], isLoading, error } = useGetCartQuery();
  const { data = {}, isLoading, error } = useGetCartQuery();
  const {
    cartItems = [],
    itemsPrice = 0,
    shippingPrice = 0,

    totalPrice = 0,
  } = data;

  const [removeFromCart] = useRemoveFromCartMutation();

  const [addToCart] = useAddToCartMutation(); //loading & error should be added here

  const addToCartHandler = async (bookId, qty) => {
    try {
      await addToCart({ book_id: bookId, quantity: qty }).unwrap();
      toast.success("Added to Cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCartHandler = async (book_id) => {
    try {
      await removeFromCart(book_id).unwrap();
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  // const cart = useSelector((state) => state.cart);
  // const { cartItems } = cart;

  // const addToCartHandler = async (product, qty) => {
  //   dispatch(addToCart({ ...product, qty }));
  // };
  // const removeFromCartHandler = async (id) => {
  //   dispatch(removeFromCart(id));
  // };
  const checkoutHandler = () => {
    navigate("/login?redirect=/placeorder");
  };

  return (
    <Row>
      <Col md={8}>
        <h1 style={{ marginButtom: "20px" }}>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <Message>
            Your Cart is Empty <Link to="/">Go Back</Link>
          </Message>
        ) : (
          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id}>
                <Row>
                  <Col md={2}>
                    <Image src={item.image} alt={item.title} fluid rounded />
                  </Col>
                  <Col md={3}>
                    <Link to={`/product/${item.id}`}>{item.title}</Link>
                  </Col>
                  <Col md={2}>$ {item.price}</Col>

                  <Col md={3}>
                    <QuantitySelector
                      qty={item.quantity}
                      setQty={(newQty) => addToCartHandler(item.id, newQty)}
                      stock={item.stock}
                    />
                  </Col>
                 

                  <Col md={2}>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => removeFromCartHandler(item.id)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                Subtotal (
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}) Books
              </h2>
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Items Price:</strong> $ {itemsPrice.toFixed(2)}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Shipping:</strong> $ {shippingPrice.toFixed(2)}
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Total:</strong> $ {totalPrice.toFixed(2)}
            </ListGroup.Item>

            <ListGroup.Item>
              <Button
                type="button"
                className="btn-block"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartScreen;
