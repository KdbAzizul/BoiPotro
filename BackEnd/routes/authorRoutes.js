import { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } from "../controllers/authorController.js";
import express from "express";

const router =express.Router();

router.route('/').get(getAllAuthors);
router.route('/:id').get(getAuthorById);
router.route('/').post(createAuthor);
router.route('/:id').put(updateAuthor);
router.route('/:id').delete(deleteAuthor);


export default router;