import { protect} from "../middleware/authMiddleware.js";
import express from 'express';
import { addToCart,removeFromCart,getCartItems,clearCart } from "../controllers/cartController.js";

const router =express.Router();

router.route('/:book_id').delete(protect,removeFromCart);
router.route('/').get(protect,getCartItems).post(protect,addToCart).delete(protect,clearCart);


export default router;