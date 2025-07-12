import { getProducts,
    getProductsById,
    getBooksByCategory,
    getBooksByAuthor,
    createProductReview,
    searchBooks,
    createBook,
  updateBook,
  deleteBook,
 } 
from "../controllers/productController.js";
import { protect,admin } from "../middleware/authMiddleware.js";
import express from "express";

const router =express.Router();

router.route('/search').get(searchBooks);

router.route('/').get(getProducts);

router.route('/category/:categoryId').get(getBooksByCategory); 

router.route('/authors/:authorId').get(getBooksByAuthor);

router.route('/:id/review').post(protect,createProductReview);

router.route('/:id').get(getProductsById).delete(protect,admin,deleteBook);

export default router;