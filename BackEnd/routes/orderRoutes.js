import { 
    validateCoupon,
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderState,
    updateOrderToPaid,
    getOrders,
} from "../controllers/orderController.js";
import express from "express";
import { protect,admin } from "../middleware/authMiddleware.js";

const router =express.Router();

router.route('/validateCoupon').post(protect,validateCoupon);
router.route('/mine').get(protect,getMyOrders);
router.route('/:id').get(protect,getOrderById);
router.route('/:id/pay').put(protect,updateOrderToPaid);
router.route('/:id/state').put(protect,admin,updateOrderState);
router.route('/').post(protect,addOrderItems).get(protect,admin,getOrders);

export default router;