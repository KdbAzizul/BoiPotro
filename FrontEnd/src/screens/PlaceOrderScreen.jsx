import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Row, Col, ListGroup, Image, Card, Form } from "react-bootstrap";
import CheckoutSteps from "../components/CheckoutSteps";
import { toast } from "react-toastify";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useCreateOrderMutation,
  useValidateCouponMutation,
} from "../slices/ordersApiSlice";
import { useGetCartQuery, useClearCartMutation } from "../slices/cartApiSlice";
import { saveShippingAddress, savePaymentMethod } from "../slices/cartSlice";

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: cart, isLoading: cartLoading, refetch } = useGetCartQuery();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  // Shipping address state
  const { shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || "");
  const [country, setCountry] = useState(shippingAddress?.country || "");
  const [fullName, setFullName] = useState(shippingAddress?.fullName || "");
  const [phone, setPhone] = useState(shippingAddress?.phone || "");

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod || "SSLCommerz");

  useEffect(() => {
    if (cart?.totalPrice) {
      setNewTotal(cart.totalPrice);
    }
  }, [cart?.totalPrice]);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [validateCoupon, { isLoading: validatingCoupon }] = useValidateCouponMutation();
  const [clearCart] = useClearCartMutation();

  const applyCouponHandler = async () => {
    console.log("🔍 applyCouponHandler triggered");
    try {
      const res = await validateCoupon({
        code: couponCode,
      }).unwrap();

      console.log("🔁 Coupon validation response:", res);

      if (res.valid) {
        setCouponApplied(true);
        setDiscountAmount(res.discount.final_discount_amount);
        setNewTotal(res.new_total);
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

  const placeOrderHandler = async () => {
    // Validate shipping address
    if (!address || !city || !postalCode || !country || !fullName || !phone) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    // Save shipping address and payment method to Redux
    const shippingData = { address, city, postalCode, country, fullName, phone };
    dispatch(saveShippingAddress(shippingData));
    dispatch(savePaymentMethod(selectedPaymentMethod));

    if (selectedPaymentMethod === "SSLCommerz") {
      // Handle SSLCommerz payment
      try {
        const response = await fetch("/api/payment/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems: cart.cartItems,
            shippingAddress: shippingData,
            totalPrice: newTotal,
            couponName: couponApplied ? couponCode : null,
          }),
        });
        console.log("📡 Response Status:", response.status);
        const data = await response.json();
        console.log("💳 Payment Init Response:", data);

        if (data.GatewayPageURL) {
          window.location.href = data.GatewayPageURL;
        } else {
          toast.error("Payment gateway failed to respond");
        }
      } catch (err) {
        toast.error("Something went wrong with payment init");
        console.error(err);
      }
    } else {
      // Handle Cash on Delivery
      try {
        const res = await createOrder({
          cartItems: cart.cartItems,
          shippingAddress: shippingData,
          paymentMethod: selectedPaymentMethod,
          totalPrice: newTotal,
          couponName: couponApplied ? couponCode : null,
          is_paid: false, // Cash on delivery is not paid initially
        }).unwrap();

        if (res.id) {
          // Add a small delay before clearing the cart
          setTimeout(async () => {
            try {
              await clearCart().unwrap();
              await refetch(); // Refresh the cart data
              toast.success("Order placed successfully! Pay on delivery.");
            } catch (clearError) {
              console.error('Error clearing cart:', clearError);
              // Attempt to clear cart one more time after a delay
              setTimeout(async () => {
                try {
                  await clearCart().unwrap();
                  await refetch(); // Refresh the cart data
                } catch (retryError) {
                  console.error('Failed to clear cart on retry:', retryError);
                }
              }, 1000);
            }
          }, 500);

          // Navigate immediately after order creation
          navigate(`/order/${res.id}`);
        }
      } catch (error) {
        toast.error(error?.data?.message || "Order creation failed");
        console.error(error);
      }
    }
  };

  if (cartLoading) return <Loader />;

  return (
    <>
      <CheckoutSteps step1 step2 step3 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            {/* Shipping Address Form */}
            <ListGroup.Item>
              <h2>Shipping Address</h2>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="fullName" className="my-2">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="phone" className="my-2">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group controlId="address" className="my-2">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId="city" className="my-2">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="postalCode" className="my-2">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="country" className="my-2">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </ListGroup.Item>

            {/* Payment Method Selection */}
            <ListGroup.Item>
              <h2>Payment Method</h2>
              <Form.Group>
                <Form.Label as="legend">Select Payment Method</Form.Label>
                <Col>
                  <Form.Check
                    type="radio"
                    className="my-2"
                    label="SSLCommerz (Credit Card, Mobile Banking, etc.)"
                    id="SSLCommerz"
                    name="paymentMethod"
                    value="SSLCommerz"
                    checked={selectedPaymentMethod === "SSLCommerz"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    className="my-2"
                    label="Cash on Delivery"
                    id="CashOnDelivery"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={selectedPaymentMethod === "Cash on Delivery"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                </Col>
              </Form.Group>
            </ListGroup.Item>

            {/* Order Items */}
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
                    <Form.Control
                      type="text"
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
                  disabled={cart.cartItems.length === 0 || isLoading}
                  onClick={placeOrderHandler}
                >
                  {isLoading ? "Processing..." : "Place Order"}
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
