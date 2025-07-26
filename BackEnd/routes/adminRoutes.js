import express from "express";
import { getSalesStats, getTopEntitiesAndUsersStats, getReviewsAndInventoryStats } from "../controllers/adminStatsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/sales-stats", protect, admin, getSalesStats);
router.get("/top-entities", protect, admin, getTopEntitiesAndUsersStats);
router.get("/reviews-inventory-stats", protect, admin, getReviewsAndInventoryStats);

export default router; 