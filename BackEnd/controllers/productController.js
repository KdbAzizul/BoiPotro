import pool from '../db.js';
import asyncHandler from '../middleware/asyncHandler.js';


//@desc     Fetch all products
//@route    GET  /api/products
//@access   public 
const getProducts=asyncHandler(async (req,res)=>{
    
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
const getProductsById=asyncHandler(async(req,res)=>{

    const id = req.params.id;
    
    const result = await pool.query(`
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
  `, [id]);


    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result.rows[0];
    res.json(product);

})
// @desc Get books by category
// @route GET /api/books/category/:categoryId
// @access Public
const getBooksByCategory = asyncHandler(async (req, res) => {
const { categoryId } = req.params;

const result = await pool.query(`SELECT b.*,bc.category_id FROM "BOIPOTRO".books b JOIN "BOIPOTRO".book_categories bc ON b.id = bc.book_id WHERE bc.category_id = $1`, [categoryId]);

res.json(result.rows);
});




const getBooksByAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const result = await pool.query(`
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
  `, [authorId]);

  res.json(result.rows);
});


export {getProducts,getProductsById,getBooksByCategory,getBooksByAuthor};
