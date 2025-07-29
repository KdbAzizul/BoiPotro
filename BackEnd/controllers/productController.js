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
        b.stock,
        b.discount,
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
      'SELECT id, name, address, website, contact_email FROM "BOIPOTRO"."publishers" ORDER BY name'
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
        b.publisher_id,
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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const { rating, comment } = req.body;

    // First check if book exists
    const bookQuery = await client.query(
      `SELECT id
       FROM "BOIPOTRO"."books"
       WHERE id=$1;`,
      [req.params.id]
    );

    if (bookQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Book not found" });
    }

    const book_id = bookQuery.rows[0].id;

    // Check if user has already reviewed
    const alreadyReviewed = await client.query(
      `SELECT user_id
       FROM "BOIPOTRO"."reviews"
       WHERE book_id=$1 AND user_id=$2;`,
      [book_id, req.user.id]
    );

    if (alreadyReviewed.rowCount === 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Book Already Reviewed" });
    }

    // Create the review
    await client.query(
      `INSERT INTO "BOIPOTRO"."reviews"
       (user_id, book_id, rating, comment)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, book_id, rating, comment]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createProductReview:', error);
    res.status(500).json({ 
      message: "Failed to create review",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// @desc create a book
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      title,
      description,
      price,
      stock,
      discount,
      isbn,
      publication_date,
      publisher_id,
      Image,
      authors = [],
      categories = [],  
    } = req.body;

    // Validate required fields
    if (!title || !price || !stock) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Title, price, and stock are required" });
    }

    // Validate publisher exists
    const publisherExists = await client.query(
      `SELECT id FROM "BOIPOTRO"."publishers" WHERE id = $1`,
      [publisher_id]
    );

    if (publisherExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Invalid publisher ID" });
    }

    // Create the book
    const bookResult = await client.query(
      `INSERT INTO "BOIPOTRO"."books"
       (title, description, price, stock, discount, isbn, publication_date, publisher_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        title,
        description || null,
        price,
        stock,
        discount || 0,
        isbn || null,
        publication_date || null,
        publisher_id,
      ]
    );

    const bookId = bookResult.rows[0].id;

    // Insert image if provided
    if (Image) {
      await client.query(
        `INSERT INTO "BOIPOTRO"."book_photos" (book_id, photo_url, photo_order)
         VALUES ($1, $2, $3)`,
        [bookId, Image, 1]
      );
    }

    // Insert authors
    if (authors && authors.length > 0) {
      for (const authorName of authors) {
        // Find author by name
        const authorResult = await client.query(
          `SELECT id FROM "BOIPOTRO"."authors" WHERE name = $1`,
          [authorName]
        );

        if (authorResult.rows.length > 0) {
          const authorId = authorResult.rows[0].id;
          // Insert book-author relationship
          await client.query(
            `INSERT INTO "BOIPOTRO"."bookauthors" (book_id, author_id)
             VALUES ($1, $2)`,
            [bookId, authorId]
          );
        }
      }
    }

    // Insert categories
    if (categories && categories.length > 0) {
      for (const categoryName of categories) {
        // Find category by name
        const categoryResult = await client.query(
          `SELECT id FROM "BOIPOTRO"."categories" WHERE name = $1`,
          [categoryName]
        );

        if (categoryResult.rows.length > 0) {
          const categoryId = categoryResult.rows[0].id;
          // Insert book-category relationship
          await client.query(
            `INSERT INTO "BOIPOTRO"."book_categories" (book_id, category_id)
             VALUES ($1, $2)`,
            [bookId, categoryId]
          );
        }
      }
    }

    await client.query('COMMIT');
    
    // Fetch the complete book data to return
    const completeBookResult = await client.query(
      `SELECT 
        b.id,
        b.title,
        b.description,
        b.price,
        b.stock,
        b.discount,
        b.isbn,
        b.publication_date,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publisher
       FROM "BOIPOTRO"."books" b
       LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
       LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
       LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
       LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
       LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
       LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
       WHERE b.id = $1
       GROUP BY b.id, bp.photo_url, p.name`,
      [bookId]
    );

    res.status(201).json(completeBookResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createProduct:', error);
    res.status(500).json({ 
      message: "Failed to create product",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// @desc update a book info
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Check if book exists
    const book = await client.query(
      `SELECT * FROM "BOIPOTRO"."books" WHERE id = $1`,
      [id]
    );
    
    if (book.rows.length === 0) {
      await client.query('ROLLBACK');
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
      Image,
      authors = [],
      categories = [],
    } = req.body;

    // Validate publisher if changed
    if (publisher_id !== book.rows[0].publisher_id) {
      const publisherExists = await client.query(
        `SELECT id FROM "BOIPOTRO"."publishers" WHERE id = $1`,
        [publisher_id]
      );

      if (publisherExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: "Invalid publisher ID" });
      }
    }

    // Update the book
    const updated = await client.query(
      `UPDATE "BOIPOTRO"."books"
       SET title=$1, description=$2, price=$3, stock=$4,
           discount=$5, isbn=$6, publication_date=$7, publisher_id=$8
       WHERE id=$9 
       RETURNING id`,
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

    // Update image if provided
    if (Image !== undefined) {
      // Delete existing image
      await client.query(
        `DELETE FROM "BOIPOTRO"."book_photos" WHERE book_id = $1`,
        [id]
      );
      
      // Insert new image if provided
      if (Image) {
        await client.query(
          `INSERT INTO "BOIPOTRO"."book_photos" (book_id, photo_url, photo_order)
           VALUES ($1, $2, $3)`,
          [id, Image, 1]
        );
      }
    }

    // Update authors if provided
    if (authors !== undefined) {
      // Delete existing author relationships
      await client.query(
        `DELETE FROM "BOIPOTRO"."bookauthors" WHERE book_id = $1`,
        [id]
      );
      
      // Insert new author relationships
      if (authors && authors.length > 0) {
        for (const authorName of authors) {
          const authorResult = await client.query(
            `SELECT id FROM "BOIPOTRO"."authors" WHERE name = $1`,
            [authorName]
          );

          if (authorResult.rows.length > 0) {
            const authorId = authorResult.rows[0].id;
            await client.query(
              `INSERT INTO "BOIPOTRO"."bookauthors" (book_id, author_id)
               VALUES ($1, $2)`,
              [id, authorId]
            );
          }
        }
      }
    }

    // Update categories if provided
    if (categories !== undefined) {
      // Delete existing category relationships
      await client.query(
        `DELETE FROM "BOIPOTRO"."book_categories" WHERE book_id = $1`,
        [id]
      );
      
      // Insert new category relationships
      if (categories && categories.length > 0) {
        for (const categoryName of categories) {
          const categoryResult = await client.query(
            `SELECT id FROM "BOIPOTRO"."categories" WHERE name = $1`,
            [categoryName]
          );

          if (categoryResult.rows.length > 0) {
            const categoryId = categoryResult.rows[0].id;
            await client.query(
              `INSERT INTO "BOIPOTRO"."book_categories" (book_id, category_id)
               VALUES ($1, $2)`,
              [id, categoryId]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    
    // Fetch the complete updated book data to return
    const completeBookResult = await client.query(
      `SELECT 
        b.id,
        b.title,
        b.description,
        b.price,
        b.stock,
        b.discount,
        b.isbn,
        b.publication_date,
        bp.photo_url AS image,
        ARRAY_AGG(DISTINCT a.name) AS authors,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        p.name AS publisher
       FROM "BOIPOTRO"."books" b
       LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
       LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
       LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
       LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
       LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
       LEFT JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
       WHERE b.id = $1
       GROUP BY b.id, bp.photo_url, p.name`,
      [id]
    );

    res.json(completeBookResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateProduct:', error);
    res.status(500).json({ 
      message: "Failed to update product",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// @desc delete a book
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Check if book exists
    const check = await client.query(
      `SELECT id FROM "BOIPOTRO"."books" WHERE id=$1`,
      [id]
    );
    
    if (check.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if book is in any user's cart (picked_items)
    const inCart = await client.query(
      `SELECT 1 FROM "BOIPOTRO"."picked_items" WHERE book_id = $1 LIMIT 1`,
      [id]
    );

    if (inCart.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot delete book that is currently in user carts" 
      });
    }

    // Check if book has been ordered (cartitems)
    const hasOrders = await client.query(
      `SELECT 1 FROM "BOIPOTRO"."cartitems" WHERE book_id = $1 LIMIT 1`,
      [id]
    );

    if (hasOrders.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot delete book that has been ordered" 
      });
    }

    // Delete related records first (if not using CASCADE)
    await client.query(`DELETE FROM "BOIPOTRO"."reviews" WHERE book_id = $1`, [id]);
    await client.query(`DELETE FROM "BOIPOTRO"."book_photos" WHERE book_id = $1`, [id]);
    await client.query(`DELETE FROM "BOIPOTRO"."bookauthors" WHERE book_id = $1`, [id]);
    await client.query(`DELETE FROM "BOIPOTRO"."book_categories" WHERE book_id = $1`, [id]);
    
    // Finally delete the book
    await client.query(`DELETE FROM "BOIPOTRO"."books" WHERE id = $1`, [id]);

    await client.query('COMMIT');
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ 
      message: "Failed to delete product",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
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
