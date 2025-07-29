import express from "express";
import {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../controllers/publisherController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.route("/").get(getPublishers);
router.route("/:id").get(getPublisherById);

// Protected admin routes
router.route("/").post(protect, admin, createPublisher);
router.route("/:id").put(protect, admin, updatePublisher);
router.route("/:id").delete(protect, admin, deletePublisher);

export default router; 