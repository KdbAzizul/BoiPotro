import { useParams, useNavigate } from "react-router-dom";
//import {useEffect,useState} from 'react'
//import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  ListGroupItem,
  Form,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Rating from "../components/Rating";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../slices/productsApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useAddToCartMutation } from "../slices/cartApiSlice";
import { toast } from "react-toastify";
import QuantitySelector from "../components/QuantitySelector";

const ProductScreen = () => {
  const { id: productId } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [qty, setQty] = useState(1);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [createReview, { isLoading: isReviewLoading }] =
    useCreateReviewMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const [addToCart] = useAddToCartMutation(); //loading & error should be added here

  const addToCartHandler = async () => {
    try {
      await addToCart({ book_id: product.id, quantity: qty }).unwrap();
      toast.success("Added to Cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  // const addToCartHandler = () => {
  //   dispatch(addToCart({ ...product, qty }));
  //   toast.success("Added to Cart Successfully");
  //   //navigate("/cart");
  // };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review Submitted");
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };
  // const [product,setProduct]=useState({});
  // useEffect(() => {
  //   const fetchProduct= async () => {
  //     const {data} = await axios.get(`/api/products/${productId}`);
  //     setProduct(data);
  //   }
  //   fetchProduct();
  // },[productId]);

  return (
    <>
      <Link className="btn btn-light my-3" to="/">
        Go Back
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Row>
            <Col md={5}>
              <Image src={product.image} alt={product.title} fluid />
            </Col>

            <Col md={4}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>{product.title}</h3>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Rating
                    value={product.star}
                    text={`${product.review_count} reviews`}
                  />
                </ListGroup.Item>

                <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
                <ListGroup.Item>
                  Description:{product.description}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Authors:</strong>{" "}
                  {product.authors && product.authors.length > 0
                    ? product.authors.join(", ")
                    : "N/A"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Categories:</strong>{" "}
                  {product.categories && product.categories.length > 0
                    ? product.categories.join(", ")
                    : "N/A"}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Publisher:</strong> {product.publication || "N/A"}
                </ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md={3}>
              <Card>
                <ListGroup>
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>
                        <strong>${product.price}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <Row>
                      <Col>Stock</Col>
                      <Col>
                        <strong>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {product.stock > 0 && (
                    <ListGroup.Item>
                      <Row className="align-items-center">
                        <Col xs={5}>Quantity</Col>

                        <Col xs={7}>
                          <QuantitySelector
                            qty={qty}
                            setQty={setQty}
                            stock={product.stock}
                          />
                        </Col>
                        {/* <Col xs={4} className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                            disabled={qty <= 1}
                          >
                            -
                          </Button>

                          <Form.Control
                            type="number"
                            value={qty}
                            onChange={(e) => {
                              const val = e.target.value;

                              // Allow temporary empty input (when user is deleting to type a new number)
                              if (val === "") {
                                setQty(""); // Set as empty string temporarily
                                return;
                              }

                              const num = Number(val);

                              // Only set qty if number is valid
                              if (
                                !isNaN(num) &&
                                num >= 1 &&
                                num <= product.stock
                              ) {
                                setQty(num);
                              }
                            }}
                            onBlur={() => {
                              // On losing focus, reset to minimum 1 if empty or invalid
                              if (qty === "" || qty < 1) {
                                setQty(1);
                              }
                            }}
                            className="mx-2 text-center"
                            style={{ width: "60px" }}
                          />

                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              setQty(qty < product.stock ? qty + 1 : qty)
                            }
                            disabled={qty >= product.stock}
                          >
                            +
                          </Button>
                        </Col> */}
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      className="btn-block"
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={addToCartHandler}
                    >
                      Add To Cart
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>

          <Row className="review">
            <Col md={6}>
              <h2>Reviews</h2>
              {product.reviews?.length === 0 && <Message>No Reviews</Message>}
              <ListGroup variant="flush">
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review.id}>
                    <strong>{review.user_name}</strong>
                    <Rating value={review.rating} />
                    <p>{review.review_date.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <h2>Write a review</h2>
                  {isReviewLoading && <Loader />}
                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group controlId="rating" className="my-2">
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          as="select"
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value="">Select...</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group controlId="comment" className="my-2">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          row="3"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                      <Button
                        disabled={isReviewLoading}
                        type="submit"
                        variant="primary"
                      >
                        Submit
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Please <Link to="/login">Sign in</Link> to write a review{" "}
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;
