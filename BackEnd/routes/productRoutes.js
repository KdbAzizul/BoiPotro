import { getProducts,getProductsById } from "../controllers/productController.js";
import express from "express";

const router =express.Router();

router.route('/').get(getProducts);

router.route('/:id').get(getProductsById);


export default router;