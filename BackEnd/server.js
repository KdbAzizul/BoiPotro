import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

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
import publisherRoutes from './routes/publisherRoutes.js';

const port=process.env.PORT || 5000;
import pool from './db.js';

const app=express();

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://boipotro.onrender.com', 'http://localhost:3000'] 
    : 'http://localhost:5173',
  credentials: true
}));

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//cookie parser middleware
app.use(cookieParser());

// API routes
app.use('/api/products',productRoutes);
app.use('/api/users',userRoutes);
app.use('/api/authors',authorRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/publishers', publisherRoutes);

// Debug route to test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('Testing database connection...');
    console.log('Environment variables:', {
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
      DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
      DB_PASS: process.env.DB_PASS ? 'SET' : 'NOT SET'
    });
    
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Database connection successful!', 
      timestamp: result.rows[0].current_time,
      env: {
        DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
        DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

// Log all requests in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Go up one level from BackEnd/ to find FrontEnd/dist
  const frontendPath = path.join(__dirname, '..', 'FrontEnd', 'dist');
  const indexPath = path.join(frontendPath, 'index.html');
  
  console.log('Production mode - serving frontend');
  console.log('Frontend path:', frontendPath);
  console.log('Index path:', indexPath);
  console.log('Frontend exists:', fs.existsSync(frontendPath));
  console.log('Index exists:', fs.existsSync(indexPath));
  
  // Serve static files from the React build
  app.use(express.static(frontendPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not found. Check if build completed successfully.');
    }
  });
} else {
  // Development route
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.listen(port,()=>console.log(`Server running on port ${port}`));