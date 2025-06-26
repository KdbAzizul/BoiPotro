import pool from '../db.js';
import asyncHandler from '../middleware/asyncHandler.js';


const getAllAuthors = asyncHandler(async (req, res) => {
const result = await pool.query('SELECT * FROM "BOIPOTRO".authors');
res.json(result.rows);
});

export{getAllAuthors};
