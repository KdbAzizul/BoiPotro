import { getAllAuthors } from "../controllers/authorController.js";
import express from "express";

const router =express.Router();

router.route('/').get(getAllAuthors);


export default router;