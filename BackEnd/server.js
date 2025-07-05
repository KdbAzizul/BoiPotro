import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const port=process.env.PORT || 5000;
import pool from './db.js';

const app=express();

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//cookie parser middleware
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send(`API is running....`);
})

app.use('/api/products',productRoutes);
app.use('/api/users',userRoutes);
app.use('/api/authors',authorRoutes);
app.use('/api/orders',orderRoutes);

// app.get('/api/products',(req,res)=>{
//     res.json(products);
// })
// app.get('/api/products/:id',(req,res)=>{
//     const product=products.find((p)=>p._id===req.params.id);
//     res.json(product);
// })

app.listen(port,()=>console.log(`Server running on port ${port}`));



