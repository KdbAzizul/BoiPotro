import pool from '../db.js';
import asyncHandler from '../middleware/asyncHandler.js';


// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
const getAllAuthors = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `SELECT a.id, 
              a.name, 
              a.bio,
              COUNT(DISTINCT b.id) as book_count,
              COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating
       FROM "BOIPOTRO"."authors" a
       LEFT JOIN "BOIPOTRO"."bookauthors" ba ON a.id = ba.author_id
       LEFT JOIN "BOIPOTRO"."books" b ON ba.book_id = b.id
       LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
       GROUP BY a.id, a.name, a.bio
       ORDER BY a.name ASC`
    );

    await client.query('COMMIT');
    res.json(result.rows);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fetching authors:', error);
    res.status(500).json({
      message: 'Failed to fetch authors',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// @desc    Get author by ID with their books
// @route   GET /api/authors/:id
// @access  Public
const getAuthorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get author details
    const authorResult = await client.query(
      `SELECT a.id, a.name, a.bio,
              COUNT(DISTINCT b.id) as book_count,
              COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating
       FROM "BOIPOTRO"."authors" a
       LEFT JOIN "BOIPOTRO"."bookauthors" ba ON a.id = ba.author_id
       LEFT JOIN "BOIPOTRO"."books" b ON ba.book_id = b.id
       LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
       WHERE a.id = $1
       GROUP BY a.id, a.name, a.bio`,
      [id]
    );

    if (authorResult.rows.length === 0) {
      throw new Error('Author not found');
    }

    // Get author's books
    const booksResult = await client.query(
      `SELECT b.id, b.title, b.price, b.discount,
              bp.photo_url as image,
              COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
              COUNT(DISTINCT r.id) as review_count
       FROM "BOIPOTRO"."books" b
       JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
       LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
       LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
       WHERE ba.author_id = $1
       GROUP BY b.id, b.title, b.price, b.discount, bp.photo_url
       ORDER BY b.publication_date DESC`,
      [id]
    );

    await client.query('COMMIT');
    res.json({
      ...authorResult.rows[0],
      books: booksResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fetching author details:', error);
    res.status(error.message === 'Author not found' ? 404 : 500).json({
      message: error.message || 'Failed to fetch author details',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// @desc    Create new author
// @route   POST /api/authors
// @access  Private/Admin
const createAuthor = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!name) {
      throw new Error('Author name is required');
    }

    // Check if author already exists
    const existingAuthor = await client.query(
      `SELECT id FROM "BOIPOTRO"."authors" WHERE name = $1`,
      [name]
    );

    if (existingAuthor.rows.length > 0) {
      throw new Error('Author already exists');
    }

    // Create new author - let PostgreSQL auto-generate the ID
    const result = await client.query(
      `INSERT INTO "BOIPOTRO"."authors" (name, bio)
       VALUES ($1, $2)
       RETURNING id, name, bio`,
      [name, bio || null]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating author:', error);
    
    // Handle specific database errors
    if (error.code === '23505') {
      res.status(400).json({
        message: 'Author already exists with this name',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else if (error.message.includes('required') || error.message.includes('exists')) {
      res.status(400).json({
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({
        message: 'Failed to create author',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } finally {
    client.release();
  }
});

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private/Admin
const updateAuthor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if author exists
    const authorExists = await client.query(
      `SELECT name, bio FROM "BOIPOTRO"."authors" WHERE id = $1`,
      [id]
    );

    if (authorExists.rows.length === 0) {
      throw new Error('Author not found');
    }

    const currentAuthor = authorExists.rows[0];

    // Update author
    const result = await client.query(
      `UPDATE "BOIPOTRO"."authors"
       SET name = $1, bio = $2
       WHERE id = $3
       RETURNING id, name, bio`,
      [
        name || currentAuthor.name,
        bio || currentAuthor.bio,
        id
      ]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating author:', error);
    res.status(error.message === 'Author not found' ? 404 : 500).json({
      message: error.message || 'Failed to update author',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// @desc    Delete author
// @route   DELETE /api/authors/:id
// @access  Private/Admin
const deleteAuthor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if author exists
    const authorExists = await client.query(
      `SELECT id FROM "BOIPOTRO"."authors" WHERE id = $1`,
      [id]
    );

    if (authorExists.rows.length === 0) {
      throw new Error('Author not found');
    }

    // Check if author has books
    const hasBooks = await client.query(
      `SELECT 1 FROM "BOIPOTRO"."bookauthors" WHERE author_id = $1 LIMIT 1`,
      [id]
    );

    if (hasBooks.rows.length > 0) {
      throw new Error('Cannot delete author with existing books');
    }

    // Delete author
    await client.query(
      `DELETE FROM "BOIPOTRO"."authors" WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting author:', error);
    res.status(
      error.message === 'Author not found' ? 404 :
      error.message.includes('existing books') ? 400 : 500
    ).json({
      message: error.message || 'Failed to delete author',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
