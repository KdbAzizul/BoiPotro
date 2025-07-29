import express from "express";
import { getSalesStats, getTopEntitiesAndUsersStats, getReviewsAndInventoryStats } from "../controllers/adminStatsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { assignCouponToUsers, assignCouponByLevel, createCoupon, getAllCoupons, deleteCoupon } from '../controllers/couponController.js';
import { getUserLevels } from '../controllers/userController.js';

const router = express.Router();

router.get("/sales-stats", protect, admin, getSalesStats);
router.get("/top-entities", protect, admin, getTopEntitiesAndUsersStats);
router.get("/reviews-inventory-stats", protect, admin, getReviewsAndInventoryStats);
router.post('/coupons/assign', protect, admin, assignCouponToUsers);
router.post('/coupons/assign-by-level', protect, admin, assignCouponByLevel);
router.post('/coupons', protect, admin, createCoupon);
router.get('/coupons', protect, admin, getAllCoupons);
router.delete('/coupons/:id', protect, admin, deleteCoupon);
router.get('/users/levels', protect, admin, getUserLevels);

export default router; 