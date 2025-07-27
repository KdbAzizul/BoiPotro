import { 
    getProducts,
    getProductsById,
    getBooksByCategory,
    getBooksByAuthor,
    createProductReview,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getAuthors,
    getPublishers,
    getFilteredProducts
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

// Search and filter routes
router.route('/search').get(searchProducts);
router.route('/filter').get(getFilteredProducts);
router.route('/categories').get(getCategories);
router.route('/authors').get(getAuthors);
router.route('/publishers').get(getPublishers);

// Category and author specific routes
router.route('/category/:categoryId').get(getBooksByCategory); 
router.route('/authors/:authorId').get(getBooksByAuthor);

// Product CRUD routes
router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id/review').post(protect, createProductReview);

router.route('/:id')
    .get(getProductsById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;