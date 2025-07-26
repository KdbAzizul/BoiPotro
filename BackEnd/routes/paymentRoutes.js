import express from "express";
import {
  initSSLCOMMERZ,
  sslcommerzIPN ,
  paymentSuccess,
  paymentCancel,
  paymentFail,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/init", protect,initSSLCOMMERZ);
router.post("/ipn", sslcommerzIPN ); // for IPN validation (optional)
router.route("/success/:tran_id").get(paymentSuccess).post(paymentSuccess);
router.route("/fail/:tran_id").get(paymentFail).post(paymentFail); 
router.route("/cancel/:tran_id").get(paymentCancel).post(paymentCancel); 

export default router;
