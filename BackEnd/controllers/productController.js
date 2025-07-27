import pool from "../db.js";
import asyncHandler from "../middleware/asyncHandler.js";

//@desc     Fetch all products with pagination
//@route    GET  /api/products
//@access   public
const getProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 8; // Default page size is 8
    const page = Number(req.query.page) || 1; // Default page is 1
    const keyword = req.query.keyword || '';
    
    console.log('Attempting to fetch products...');
    console.log('Database config:', {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    // First, get the total count of products
    let countQuery = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM "BOIPOTRO"."books" b
    `;
    
    const params = [];
    
    // Add keyword search if provided
    if (keyword) {
      countQuery += `
        LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
        LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
        LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
        LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
        LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
        WHERE b.title ILIKE $1 OR
              b.description ILIKE $1 OR
              a.name ILIKE $1 OR
              c.name ILIKE $1 OR
              p.name ILIKE $1
      `;
      params.push(`%${keyword}%`);
    }
    
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Then, get the paginated products
    let query = `
      SELECT 
        b.id,
        b.title,
        b.price,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
        COUNT(r.id) AS review_count,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publisher
      FROM "BOIPOTRO"."books" b
      LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
      LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
      LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
      LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
      LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
    `;
    
    // Add keyword search if provided
    if (keyword) {
      query += `
        WHERE b.title ILIKE $1 OR
              b.description ILIKE $1 OR
              a.name ILIKE $1 OR
              c.name ILIKE $1 OR
              p.name ILIKE $1
      `;
    }
    
    query += `
      GROUP BY b.id, b.title, b.price, bp.photo_url, p.name
      ORDER BY b.id
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    
    params.push(pageSize, (page - 1) * pageSize);
    
    const result = await pool.query(query, params);

    console.log(`Successfully fetched ${result.rows.length} products (page ${page} of ${Math.ceil(total / pageSize)})`);
    
    res.json({
      products: result.rows,
      page,
      pages: Math.ceil(total / pageSize),
      total
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

//@desc     Get all categories
//@route    GET  /api/products/categories
//@access   public
const getCategories = asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM "BOIPOTRO"."categories" ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

//@desc     Get all authors
//@route    GET  /api/products/authors
//@access   public
const getAuthors = asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM "BOIPOTRO"."authors" ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ message: 'Failed to fetch authors' });
  }
});

//@desc     Get all publishers
//@route    GET  /api/products/publishers
//@access   public
const getPublishers = asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM "BOIPOTRO"."publishers" ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ message: 'Failed to fetch publishers' });
  }
});

//@desc     Get filtered products with pagination
//@route    GET  /api/products/filter
//@access   public
const getFilteredProducts = asyncHandler(async (req, res) => {
  try {
    const { 
      categories, 
      authors, 
      publishers, 
      minPrice, 
      maxPrice, 
      rating, 
      sortBy, 
      keyword,
      page = 1,
      pageSize = 8
    } = req.query;

    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);

    // Build the base query for filtering
    let baseQuery = `
      FROM "BOIPOTRO"."books" b
      LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
      LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
      LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
      LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
      LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (categories) {
      const categoryIds = categories.split(',');
      baseQuery += ` AND bc.category_id IN (
        WITH RECURSIVE subcategories AS (
          SELECT id FROM "BOIPOTRO"."categories" WHERE id = ANY($${paramCount})
          UNION
          SELECT cr.child_id 
          FROM "BOIPOTRO"."category_relations" cr
          JOIN subcategories s ON cr.parent_id = s.id
        )
        SELECT id FROM subcategories
      )`;
      params.push(categoryIds);
      paramCount++;
    }

    if (authors) {
      const authorIds = authors.split(',');
      baseQuery += ` AND ba.author_id = ANY($${paramCount})`;
      params.push(authorIds);
      paramCount++;
    }

    if (publishers) {
      const publisherIds = publishers.split(',');
      baseQuery += ` AND b.publisher_id = ANY($${paramCount})`;
      params.push(publisherIds);
      paramCount++;
    }

    if (minPrice) {
      baseQuery += ` AND b.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      baseQuery += ` AND b.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    // Add keyword search if provided
    if (keyword) {
      const searchTerm = `%${keyword}%`;
      baseQuery += ` AND (
        b.title ILIKE $${paramCount} OR
        b.description ILIKE $${paramCount} OR
        a.name ILIKE $${paramCount} OR
        c.name ILIKE $${paramCount} OR
        p.name ILIKE $${paramCount}
      )`;
      params.push(searchTerm);
      paramCount++;
    }

    // First, get the total count of filtered products
    let countQuery = `SELECT COUNT(DISTINCT b.id) as total ${baseQuery}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Then, get the paginated filtered products
    let query = `
      SELECT DISTINCT
        b.id,
        b.title,
        b.price,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
        COUNT(r.id) AS review_count,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publisher
      ${baseQuery}
      GROUP BY b.id, b.title, b.price, bp.photo_url, p.name
    `;
    
    // Add rating filter in HAVING clause
    if (rating) {
      query += ` HAVING COALESCE(ROUND(AVG(r.rating), 1), 0) >= $${paramCount}`;
      params.push(parseFloat(rating));
      paramCount++;
    }

    // Add sorting based on sortBy parameter
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          query += ` ORDER BY b.price ASC`;
          break;
        case 'price_desc':
          query += ` ORDER BY b.price DESC`;
          break;
        case 'rating_desc':
          query += ` ORDER BY star DESC`;
          break;
        default:
          query += ` ORDER BY b.id`;
      }
    } else {
      query += ` ORDER BY b.id`;
    }

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(pageSizeNum, (pageNum - 1) * pageSizeNum);

    const result = await pool.query(query, params);
    
    res.json({
      products: result.rows,
      page: pageNum,
      pages: Math.ceil(total / pageSizeNum),
      total
    });
  } catch (error) {
    console.error('Error in getFilteredProducts:', error);
    res.status(500).json({ message: 'Failed to fetch filtered products' });
  }
});

//@desc     Fetch a product by id
//@route    GET  /api/products/:id
//@access   public
const getProductsById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const client = await pool.connect();

  try {
    const productResult = await client.query(
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
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publication
      FROM "BOIPOTRO"."books" b
      LEFT JOIN "BOIPOTRO"."book_photos" bp 
        ON b.id = bp.book_id AND bp.photo_order = 1
      LEFT JOIN "BOIPOTRO"."reviews" r 
        ON b.id = r.book_id
      LEFT JOIN "BOIPOTRO"."bookauthors" ba
        ON b.id = ba.book_id
      LEFT JOIN "BOIPOTRO"."authors" a
        ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_categories" bc
        ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c
        ON bc.category_id = c.id
      LEFT JOIN "BOIPOTRO"."publishers" p
        ON b.publisher_id = p.id
      WHERE b.id = $1
      GROUP BY b.id, bp.photo_url, p.name
      `,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResult.rows[0];

    const reviewResult = await client.query(
      `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.review_date,
        u.name AS user_name
      FROM "BOIPOTRO"."reviews" r
      JOIN "BOIPOTRO"."users" u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.review_date DESC
      `,
      [id]
    );

    product.reviews = reviewResult.rows;

    res.json(product);
  } catch (err) {
    console.error("Error fetching product details with reviews:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

const getBooksByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  try {
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
        b.id,
        b.title,
        b.price,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
        COUNT(r.id) AS review_count,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publisher
      FROM "BOIPOTRO"."books" b
      LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
      LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
      LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
      LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
      LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
      WHERE bc.category_id IN (SELECT id FROM subcategories)
      GROUP BY b.id, bp.photo_url, p.name
      ORDER BY b.id;
      `,
      [categoryId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch books by category:", err);
    res
      .status(500)
      .json({ message: "Could not retrieve category-based books" });
  }
});

const getBooksByAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.price,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
        COUNT(r.id) AS review_count,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publisher
      FROM "BOIPOTRO"."books" b
      JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
      JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
      LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
      LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
      LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
      WHERE a.id = $1
      GROUP BY b.id, bp.photo_url, p.name;
      `,
      [authorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch books by author:", err);
    res.status(500).json({ message: "Could not retrieve author-based books" });
  }
});

//@desc     Search books by any keyword (title, author, publisher, isbn, category)
//@route    GET  /api/products/search?keyword=xyz&pageNumber=1&pageSize=10
//@access   public
const searchProducts = asyncHandler(async (req, res) => {
  const { keyword, pageNumber = 1, pageSize = 10 } = req.query;
  const page = parseInt(pageNumber);
  const limit = parseInt(pageSize);
  const offset = (page - 1) * limit;

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ message: "Please provide a search keyword" });
  }

  const searchPattern = `%${keyword}%`;

  try {
    // First, get the total count of matching products
    const countResult = await pool.query(
      `
      SELECT COUNT(DISTINCT b.id) as total
      FROM "BOIPOTRO".books b
      LEFT JOIN "BOIPOTRO"."publishers" pub ON b.publisher_id = pub.id
      LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
      LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
      WHERE 
        b.title ILIKE $1 OR
        b.description ILIKE $1 OR
        b.isbn ILIKE $1 OR
        a.name ILIKE $1 OR
        pub.name ILIKE $1 OR
        c.name ILIKE $1
      `,
      [searchPattern]
    );

    const count = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(count / limit);

    // Then, get the paginated products
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.price,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS star,
        COUNT(r.id) AS review_count,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        pub.name AS publisher
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
      ORDER BY b.id
      LIMIT $2 OFFSET $3;
      `,
      [searchPattern, limit, offset]
    );

    res.json({
      products: result.rows,
      page,
      pages: totalPages,
      count
    });
  } catch (err) {
    console.error("Failed to search books:", err);
    res.status(500).json({ message: "Search failed due to server error" });
  }
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

// @desc create a book
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    stock,
    discount,
    isbn,
    publication_date,
    publisher_id,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO "BOIPOTRO"."books"
     (title, description, price, stock, discount, isbn, publication_date, publisher_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      title,
      description,
      price,
      stock,
      discount,
      isbn,
      publication_date,
      publisher_id,
    ]
  );

  res.status(201).json(result.rows[0]);
});

// @desc update a book info
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await pool.query(
    `SELECT * FROM "BOIPOTRO"."books" WHERE id = $1`,
    [id]
  );
  if (book.rows.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }

  const {
    title = book.rows[0].title,
    description = book.rows[0].description,
    price = book.rows[0].price,
    stock = book.rows[0].stock,
    discount = book.rows[0].discount,
    isbn = book.rows[0].isbn,
    publication_date = book.rows[0].publication_date,
    publisher_id = book.rows[0].publisher_id,
  } = req.body;

  const updated = await pool.query(
    `UPDATE "BOIPOTRO"."books"
     SET title=$1, description=$2, price=$3, stock=$4,
         discount=$5, isbn=$6, publication_date=$7, publisher_id=$8
     WHERE id=$9 RETURNING *`,
    [
      title,
      description,
      price,
      stock,
      discount,
      isbn,
      publication_date,
      publisher_id,
      id,
    ]
  );

  res.json(updated.rows[0]);
});

// @desc update a book info
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await pool.query(
    `SELECT id FROM "BOIPOTRO"."books" WHERE id=$1`,
    [id]
  );
  if (check.rows.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }

  await pool.query(`DELETE FROM "BOIPOTRO"."books" WHERE id = $1`, [id]);
  res.json({ message: "Book deleted successfully" });
});

export {
  getProducts,
  getProductsById,
  getBooksByCategory,
  getBooksByAuthor,
  createProductReview,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getAuthors,
  getPublishers,
  getFilteredProducts,
};
