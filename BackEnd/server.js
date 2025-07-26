import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();
import dotenv from 'dotenv'
dotenv.config();
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

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
app.use('/api/cart',cartRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/admin', adminRoutes);


// ✅ Serve frontend only in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'FrontEnd', 'dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'FrontEnd', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}



app.listen(port,()=>console.log(`Server running on port ${port}`));