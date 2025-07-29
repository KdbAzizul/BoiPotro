import pool from "../db.js";
import asyncHandler from "../middleware/asyncHandler.js";

//@desc     Fetch all publishers
//@route    GET  /api/publishers
//@access   public
const getPublishers = asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, address, website, contact_email, created_at FROM "BOIPOTRO"."publishers" ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch publishers:", err);
    res.status(500).json({ message: "Could not retrieve publishers" });
  }
});

//@desc     Fetch single publisher
//@route    GET  /api/publishers/:id
//@access   public
const getPublisherById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid publisher ID" });
  }

  const client = await pool.connect();

  try {
    const publisherResult = await client.query(
      `
      SELECT 
        p.id,
        p.name,
        p.address,
        p.website,
        p.contact_email,
        p.created_at,
        COUNT(DISTINCT b.id) as book_count
      FROM "BOIPOTRO"."publishers" p
      LEFT JOIN "BOIPOTRO"."books" b ON p.id = b.publisher_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.address, p.website, p.contact_email, p.created_at
      `,
      [id]
    );

    if (publisherResult.rows.length === 0) {
      return res.status(404).json({ message: "Publisher not found" });
    }

    const publisher = publisherResult.rows[0];

    // Get books by this publisher
    const booksResult = await client.query(
      `
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
        ARRAY_AGG(DISTINCT c.name) AS categories
      FROM "BOIPOTRO"."books" b
      LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.book_id AND bp.photo_order = 1
      LEFT JOIN "BOIPOTRO"."reviews" r ON b.id = r.book_id
      LEFT JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
      LEFT JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
      LEFT JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
      LEFT JOIN "BOIPOTRO"."categories" c ON bc.category_id = c.id
      WHERE b.publisher_id = $1
      GROUP BY b.id, b.title, b.price, b.stock, b.discount, bp.photo_url
      ORDER BY b.title
      `,
      [id]
    );

    publisher.books = booksResult.rows;

    res.json(publisher);
  } catch (err) {
    console.error("Error fetching publisher details:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

//@desc     Create a publisher
//@route    POST  /api/publishers
//@access   private/admin
const createPublisher = asyncHandler(async (req, res) => {
  const { name, address, website, contact_email } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "Publisher name is required" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if publisher already exists
    const existingPublisher = await client.query(
      `SELECT id FROM "BOIPOTRO"."publishers" WHERE name = $1`,
      [name.trim()]
    );

    if (existingPublisher.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Publisher already exists with this name" });
    }

    const result = await client.query(
      `INSERT INTO "BOIPOTRO"."publishers" (name, address, website, contact_email) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, address, website, contact_email, created_at`,
      [name.trim(), address || null, website || null, contact_email || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Publisher created successfully",
      publisher: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating publisher:', error);
    res.status(500).json({
      message: 'Failed to create publisher',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

//@desc     Update a publisher
//@route    PUT  /api/publishers/:id
//@access   private/admin
const updatePublisher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, website, contact_email } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "Publisher name is required" });
  }

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid publisher ID" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if publisher exists
    const existingPublisher = await client.query(
      `SELECT id FROM "BOIPOTRO"."publishers" WHERE id = $1`,
      [id]
    );

    if (existingPublisher.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Publisher not found" });
    }

    // Check if another publisher with the same name exists
    const duplicatePublisher = await client.query(
      `SELECT id FROM "BOIPOTRO"."publishers" WHERE name = $1 AND id != $2`,
      [name.trim(), id]
    );

    if (duplicatePublisher.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Another publisher already exists with this name" });
    }

    const result = await client.query(
      `UPDATE "BOIPOTRO"."publishers" 
       SET name = $1, address = $2, website = $3, contact_email = $4 
       WHERE id = $5 
       RETURNING id, name, address, website, contact_email, created_at`,
      [name.trim(), address || null, website || null, contact_email || null, id]
    );

    await client.query('COMMIT');

    res.json({
      message: "Publisher updated successfully",
      publisher: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating publisher:', error);
    res.status(500).json({
      message: 'Failed to update publisher',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

//@desc     Delete a publisher
//@route    DELETE  /api/publishers/:id
//@access   private/admin
const deletePublisher = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid publisher ID" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if publisher exists
    const existingPublisher = await client.query(
      `SELECT id FROM "BOIPOTRO"."publishers" WHERE id = $1`,
      [id]
    );

    if (existingPublisher.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Publisher not found" });
    }

    // Check if publisher has any books
    const booksCount = await client.query(
      `SELECT COUNT(*) as count FROM "BOIPOTRO"."books" WHERE publisher_id = $1`,
      [id]
    );

    if (parseInt(booksCount.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot delete publisher that has books associated with it" 
      });
    }

    await client.query(
      `DELETE FROM "BOIPOTRO"."publishers" WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: "Publisher deleted successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting publisher:', error);
    res.status(500).json({
      message: 'Failed to delete publisher',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

export {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
}; 