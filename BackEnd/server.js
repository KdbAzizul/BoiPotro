import express from 'express'
import dotenv from 'dotenv'
dotenv.config();

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';

const port=process.env.PORT || 5000;
import pool from './db.js';

const app=express();

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    res.send(`API is running....`);
})

app.use('/api/products',productRoutes);
app.use('/api/users',userRoutes);

// app.get('/api/products',(req,res)=>{
//     res.json(products);
// })
// app.get('/api/products/:id',(req,res)=>{
//     const product=products.find((p)=>p._id===req.params.id);
//     res.json(product);
// })

app.listen(port,()=>console.log(`Server running on port ${port}`));



