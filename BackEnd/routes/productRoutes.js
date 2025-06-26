import { getProducts,getProductsById,getBooksByCategory,getBooksByAuthor } from "../controllers/productController.js";
import express from "express";

const router =express.Router();

router.route('/').get(getProducts);

router.route('/:id').get(getProductsById);

router.route('/category/:categoryId').get(getBooksByCategory); 

router.route('/authors/:authorId').get(getBooksByAuthor);
export default router;