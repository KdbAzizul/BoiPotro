routes/bookRoutes.js

import express from 'express';
import {
getProducts,
getProductsById,
getBooksByCategory,
addBook
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';



router.route('/')
.get(getProducts) // GET all books
.post(protect, admin, addBook); // POST new book (admin only)

router.route('/:id')
.get(getProductsById); // GET book by ID

router.route('/category/:categoryId')
.get(getBooksByCategory); // GET books by category



routes/cartRoutes.js

import express from 'express';
import {
addToCart,
getUserCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';



router.route('/')
.post(protect, addToCart); // Add item to cart

router.route('/mycart')
.get(protect, getUserCart); // Get current user's cart



routes/reviewRoutes.js

import express from 'express';
import {
addReview,
getBookReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
.post(protect, addReview); // Add a review

router.route('/book/:bookId')
.get(getBookReviews); // Get reviews of a specific book



import pool from '../db.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc Get books by category
// @route GET /api/books/category/:categoryId
// @access Public
export const getBooksByCategory = asyncHandler(async (req, res) => {
const { categoryId } = req.params;

const result = await pool.query(SELECT b.* FROM "BoiPotro".books b JOIN "BoiPotro".book_categories bc ON b.id = bc.book_id WHERE bc.category_id = $1, [categoryId]);

res.json(result.rows);
});

// @desc Add a new book
// @route POST /api/books
// @access Admin
export const addBook = asyncHandler(async (req, res) => {
const {
title, description, isbn, publication_date,
price, stock, discount, publisher_id
} = req.body;

const result = await pool.query(INSERT INTO "BoiPotro".books (title, description, isbn, publication_date, price, stock, discount, publisher_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *, [title, description, isbn, publication_date, price, stock, discount, publisher_id]);

res.status(201).json(result.rows[0]);
});

// @desc Add item to cart
// @route POST /api/cart
// @access Private
export const addToCart = asyncHandler(async (req, res) => {
const { user_id, book_id, quantity, price } = req.body;

const cartRes = await pool.query(SELECT id FROM "BoiPotro".carts WHERE user_id = $1, [user_id]);

let cart_id;

if (cartRes.rows.length === 0) {
const newCart = await pool.query(INSERT INTO "BoiPotro".carts (user_id) VALUES ($1) RETURNING id, [user_id]);
cart_id = newCart.rows[0].id;
} else {
cart_id = cartRes.rows[0].id;
}

const itemResult = await pool.query(INSERT INTO "BoiPotro".cartitems (cart_id, book_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *, [cart_id, book_id, quantity, price]);

res.status(201).json(itemResult.rows[0]);
});

// @desc Add a review
// @route POST /api/reviews
// @access Private
export const addReview = asyncHandler(async (req, res) => {
const { user_id, book_id, rating, comment } = req.body;

const result = await pool.query(INSERT INTO "BoiPotro".reviews (user_id, book_id, rating, comment, review_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *, [user_id, book_id, rating, comment]);

res.status(201).json(result.rows[0]);
});

// @desc Get reviews of a book
// @route GET /api/reviews/book/:bookId
// @access Public
export const getBookReviews = asyncHandler(async (req, res) => {
const { bookId } = req.params;

const result = await pool.query(SELECT r.*, u.name FROM "BoiPotro".reviews r JOIN "BoiPotro".users u ON r.user_id = u.id WHERE r.book_id = $1 ORDER BY r.review_date DESC, [bookId]);

res.json(result.rows);
});