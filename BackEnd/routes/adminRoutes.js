import express from "express";
import { getSalesStats, getTopEntitiesAndUsersStats, getReviewsAndInventoryStats } from "../controllers/adminStatsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { assignCouponToUsers, createCoupon, getAllCoupons, deleteCoupon } from '../controllers/couponController.js';
const router = express.Router();

router.get("/sales-stats", protect, admin, getSalesStats);
router.get("/top-entities", protect, admin, getTopEntitiesAndUsersStats);
router.get("/reviews-inventory-stats", protect, admin, getReviewsAndInventoryStats);
router.post('/coupons/assign', protect, admin, assignCouponToUsers);
router.post('/coupons', protect, admin, createCoupon);
router.get('/coupons', protect, admin, getAllCoupons);
router.delete('/coupons/:id', protect, admin, deleteCoupon);

export default router; 