import pool from '../db.js';
import asyncHandler from '../middleware/asyncHandler.js';
//@desc     Fetch all products
//@route    GET  /api/products
//@access   public 
const getProducts=asyncHandler(async (req,res)=>{
    
    const result = await pool.query('SELECT * FROM "BoiPotro"."book"');

    //const result = await pool.query('SELECT * FROM book');
    res.json(result.rows);
})
//@desc     Fetch a product by id
//@route    GET  /api/products/:id
//@access   public 
const getProductsById=asyncHandler(async(req,res)=>{

    const id = req.params.id;
    
    const result = await pool.query('SELECT * FROM "BoiPotro"."book" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result.rows[0];
    res.json(product);

})

export {getProducts,getProductsById};