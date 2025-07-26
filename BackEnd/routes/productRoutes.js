import { getProducts,
    getProductsById,
    getBooksByCategory,
    getBooksByAuthor,
    createProductReview,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
 } 
from "../controllers/productController.js";
import { protect,admin } from "../middleware/authMiddleware.js";
import express from "express";

const router =express.Router();

router.route('/search').get(searchProducts);

router.route('/').get(getProducts).post(protect,admin,createProduct);

router.route('/category/:categoryId').get(getBooksByCategory); 

router.route('/authors/:authorId').get(getBooksByAuthor);

router.route('/:id/review').post(protect,createProductReview);

router.route('/:id').get(getProductsById).put(protect,admin,updateProduct).delete(protect,admin,deleteProduct);

export default router;