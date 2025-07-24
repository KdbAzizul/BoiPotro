import { Card,Button,Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { useAddToCartMutation } from "../slices/cartApiSlice";
import { toast } from "react-toastify";

const Product = ({ product }) => {

    
  const [addToCart,{ isLoading, error }] = useAddToCartMutation(); //loading & error should be added here

  const addToCartHandler = async () => {
    try {
      await addToCart({ book_id: product.id, quantity: 1 }).unwrap();
      toast.success("Added to Cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
}
    return (
      <Card className="my-3 p-3 rounded shadow-sm" style={{ minHeight: "480px"}}>
        <Link to={`/product/${product.id}`}>
          <Card.Img src={product.image} variant="top" style={{ height: "200px",objectFit: "contain" }} />
        </Link>

        <Card.Body className="d-flex flex-column justify-content-between">
          <Link to={`/product/${product.id}`}>
            <Card.Title as="div">
              <strong>{product.title}</strong>
            </Card.Title>
          </Link>
          <Card.Text>
            <Rating
              value={product.star}
              text={`${product.review_count} reviews`}
            />
          </Card.Text>

          <Card.Text as="h3">${product.price}</Card.Text>
{/* 
          <Button variant="primary" onClick={addToCartHandler} className="mt-3">
            Add to Cart
          </Button> */}

          <Button
          variant="primary"
          onClick={addToCartHandler}
          className="mt-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" role="status" className="me-2" />
              Adding...
            </>
          ) : (
            "Add to Cart"
          )}
        </Button>
        </Card.Body>
      </Card>
    );
  };

export default Product;
