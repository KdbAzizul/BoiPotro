import express from 'express';
import {
  
  
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { updateOrderState } from '../controllers/orderController.js';

const router = express.Router();

router.use(protect, admin);

router.route('/').post(createBook);
router.route('/:id').put(updateBook).delete(deleteBook);



export default router;