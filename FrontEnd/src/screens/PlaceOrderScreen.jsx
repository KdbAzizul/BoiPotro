import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import CheckoutSteps from "../components/CheckoutSteps";
import { toast } from "react-toastify";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useCreateOrderMutation,
  useValidateCouponMutation,
} from "../slices/ordersApiSlice";
import { useGetCartQuery,useClearCartMutation } from "../slices/cartApiSlice";


const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: cart, isLoading: cartLoading, refetch } = useGetCartQuery();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  useEffect(() => {
    if (cart?.totalPrice) {
      setNewTotal(cart.totalPrice);
    }
  }, [cart?.totalPrice]);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  const [validateCoupon, { isLoading: validatingCoupon }] =
    useValidateCouponMutation();

  const applyCouponHandler = async () => {
    console.log("🔍 applyCouponHandler triggered");
    try {
      const res = await validateCoupon({
        code: couponCode,
        //cart_total: cart.totalPrice,
      }).unwrap();

      console.log("🔁 Coupon validation response:", res);

      if (res.valid) {
        setCouponApplied(true);
        setDiscountAmount(res.discount.final_discount_amount);
        setNewTotal(res.new_total);
        // ✅ Log directly from response
        console.log("✔️ Coupon applied:");
        console.log("New total:", res.new_total);
        console.log("Discount:", res.discount.final_discount_amount);

        toast.success("Coupon applied successfully!");
      } else {
        toast.error(res.error || "Invalid coupon");
      }
    } catch (err) {
      console.error("❌ Coupon validation failed:", err);
      toast.error("Failed to validate coupon");
    }
  };

  const { shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  useEffect(() => {
    if (!shippingAddress?.address) {
      navigate("/shipping");
    } else if (!paymentMethod) {
      navigate("/payment");
    }
  }, [shippingAddress, paymentMethod, navigate]);

  // useEffect(() => {
  //   if (!cart.shippingAddress.address) {
  //     navigate("/shipping");
  //   } else if (!cart.paymentMethod) {
  //     navigate("/payment");
  //   }
  // }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);
  const [clearCart] = useClearCartMutation();

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        cartItems: cart.cartItems,
        shippingAddress,
        paymentMethod,
        totalPrice: newTotal, // Use discounted total
        couponName: couponApplied ? couponCode : null,
      }).unwrap();

      await clearCart().unwrap();
      //dispatch(clearCartItems());
      navigate(`/order/${res.id}`);
    } catch (error) {
      toast.error(error);
    }
  };

  if (cartLoading) return <Loader />;

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address : </strong>
                {shippingAddress.address},{shippingAddress.city},
                {shippingAddress.postalCode},
                {shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method : </strong>
              {paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your Cart is Empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={2}>
                          <Image
                            src={item.image}
                            alt={item.title}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.id}`}>{item.title}</Link>
                        </Col>

                        <Col md={4}>
                          {item.quantity} X ${item.finalPrice} = $
                          {(item.quantity * item.finalPrice).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
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
                  <Col>Items:</Col>
                  <Col>${cart.itemsPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping:</Col>
                  <Col>${cart.shippingPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={applyCouponHandler}
                      disabled={couponApplied || validatingCoupon}
                    >
                      {validatingCoupon ? "Checking..." : "Apply"}
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>

              {couponApplied && (
                <ListGroup.Item>
                  <Row>
                    <Col>Discount:</Col>
                    <Col className="text-success">
                      - ${discountAmount.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}

              <ListGroup.Item>
                <Row>
                  <Col>Total:</Col>
                  <Col>
                    {couponApplied ? (
                      <>
                        <del className="text-muted">${cart.totalPrice}</del>{" "}
                        <strong className="text-success">
                          ${newTotal.toFixed(2)}
                        </strong>
                      </>
                    ) : (
                      <>${cart.totalPrice}</>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                {error && <Message variant="danger">{error}</Message>}
              </ListGroup.Item>

              <ListGroup.Item>
                <Button
                  type="button"
                  className="btn-block"
                  disabled={cart.cartItems.length === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>

                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
