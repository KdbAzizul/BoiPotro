import { Link } from "react-router-dom";
import { Typography, Box, CircularProgress } from "@mui/material";
import Rating from "./Rating";
import { useAddToCartMutation } from "../slices/cartApiSlice";
import { toast } from "react-toastify";
import Card from "./ui/Card";
import Button from "./ui/Button";

const Product = ({ product }) => {
  const [addToCart, { isLoading, error }] = useAddToCartMutation();

  const addToCartHandler = async () => {
    try {
      await addToCart({ book_id: product.id, quantity: 1 }).unwrap();
      toast.success("Added to Cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  }
    return (
      <Box sx={{ height: '100%', position: 'relative' }}>
        <Link 
          to={`/product/${product.id}`} 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Card
            image={product.image}
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <Box sx={{ flexGrow: 1, p: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {product.title}
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Rating value={product.star} text={""} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
                </Typography>
              </Box>

              <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                ${product.price}
              </Typography>
            </Box>
          </Card>
        </Link>

        <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.preventDefault();
              addToCartHandler();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Adding...
              </Box>
            ) : (
              "Add to Cart"
            )}
          </Button>
        </Box>
      </Box>
    );
};

export default Product;
