import pool from "../db.js";
import asyncHandler from "../middleware/asyncHandler.js";

//@desc     Fetch all products
//@route    GET  /api/products
//@access   public
const getProducts = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT 
      b.id,
      b.title,
      b.price,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
      COUNT(r.id) AS review_count,
      bp.photo_url AS image
    FROM "BOIPOTRO"."books" b
    LEFT JOIN "BOIPOTRO"."book_photos" bp 
      ON b.id = bp.book_id AND bp.photo_order = 1
    LEFT JOIN "BOIPOTRO"."reviews" r 
      ON b.id = r.book_id
    GROUP BY b.id, b.title, b.price, bp.photo_url
    ORDER BY b.id;
  `);

  res.json(result.rows);
});

//@desc     Fetch a product by id
//@route    GET  /api/products/:id
//@access   public
const getProductsById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const result = await pool.query(
    `
    SELECT 
      b.id,
      b.title,
      b.description,
      b.price,
      b.stock,
      b.discount,
      b.isbn,
      b.publication_date,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
      COUNT(r.id) AS review_count,
      bp.photo_url AS image
    FROM "BOIPOTRO"."books" b
    LEFT JOIN "BOIPOTRO"."book_photos" bp 
      ON b.id = bp.book_id AND bp.photo_order = 1
    LEFT JOIN "BOIPOTRO"."reviews" r 
      ON b.id = r.book_id
    WHERE b.id = $1
    GROUP BY b.id, bp.photo_url;
  `,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = result.rows[0];
  res.json(product);
});
// // @desc Get books by category
// // @route GET /api/books/category/:categoryId
// // @access Public
// const getBooksByCategory = asyncHandler(async (req, res) => {
//   const { categoryId } = req.params;

//   const result = await pool.query(
//     `SELECT b.*,bc.category_id FROM "BOIPOTRO".books b JOIN "BOIPOTRO".book_categories bc ON b.id = bc.book_id WHERE bc.category_id = $1`,
//     [categoryId]
//   );

//   res.json(result.rows);
// });




// @desc Get books by category and its subcategories
// @route GET /api/products/category/:categoryId
// @access Public
const getBooksByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const result = await pool.query(
    `
    WITH RECURSIVE subcategories AS (
      SELECT id FROM "BOIPOTRO"."categories" WHERE id = $1
      UNION
      SELECT cr.child_id 
      FROM "BOIPOTRO"."category_relations" cr
      JOIN subcategories s ON cr.parent_id = s.id
    )
    SELECT 
      b.*,
      bc.category_id
    FROM "BOIPOTRO"."books" b
    JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
    WHERE bc.category_id IN (SELECT id FROM subcategories);
    `,
    [categoryId]
  );

  res.json(result.rows);
});


const getBooksByAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const result = await pool.query(
    `
    SELECT 
      b.id,
      b.title,
      b.description,
      b.price,
      b.stock,
      b.discount,
      b.isbn,
      b.publication_date,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
      COUNT(r.id) AS review_count,
      bp.photo_url AS image,
      ba.author_id
    FROM "BOIPOTRO"."books" b
    JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
    JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
    LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
    LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
    WHERE a.id = $1
    GROUP BY b.id, bp.photo_url,ba.author_id;
  `,
    [authorId]
  );

  res.json(result.rows);
});


//@desc     Search books by any keyword (title, author, publisher, isbn, category)
//@route    GET  /api/products/search?keyword=xyz
//@access   public
const searchBooks = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ message: "Please provide a search keyword" });
  }

  const searchPattern = `%${keyword}%`;

  const result = await pool.query(
    `
    SELECT 
      b.id,
      b.title,
      b.description,
      b.isbn,
      b.publication_date,
      b.price,
      b.stock,
      b.discount,
      pub.name AS publisher_name,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
      COUNT(r.id) AS review_count,
      bp.photo_url AS image
    FROM "BOIPOTRO".books b
    LEFT JOIN "BOIPOTRO"."publishers" pub ON b.publisher_id = pub.id
    LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
    LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
    LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
    LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
    LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
    LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
    WHERE 
      b.title ILIKE $1 OR
      b.description ILIKE $1 OR
      b.isbn ILIKE $1 OR
      a.name ILIKE $1 OR
      pub.name ILIKE $1 OR
      c.name ILIKE $1
    GROUP BY b.id, pub.name, bp.photo_url
    ORDER BY b.id;
    `,
    [searchPattern]
  );

  res.json(result.rows);
});


//@desc     create a review
//@route    POST  /api/products/:id/review
//@access   private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const bookQuery = await pool.query(
    `SELECT id
      FROM "BOIPOTRO"."books"
      WHERE id=$1;`,
    [req.params.id]
  );

   const book_id = bookQuery.rows[0].id;

  if (book_id) {
    const alreadyReviewed = await pool.query(
      `
          SELECT user_id
          FROM "BOIPOTRO"."reviews"
          WHERE book_id=$1 AND user_id=$2;
        `,
      [book_id, req.user.id]
    );

    if (alreadyReviewed.rowCount === 1) {
      return res.status(404).json({ message: "Book Already Reviewed" });
    }

    const reviewRes = await pool.query(
      `INSERT INTO "BOIPOTRO"."reviews"
        (user_id,book_id,rating,comment)
        values
        ($1,$2,$3,$4)
        `,
      [req.user.id, book_id, rating, comment]
    );

    res.status(201).json({ message: "Review added successfully" });
  } else {
    res.status(404).json({ message: "Resource not found" });
  }
});

export { getProducts, getProductsById, getBooksByCategory, getBooksByAuthor,createProductReview ,searchBooks};
