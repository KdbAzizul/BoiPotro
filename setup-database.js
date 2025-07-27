import pool from './BackEnd/db.js';
import fs from 'fs';
import path from 'path';

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'SQL', 'Database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.code === '42P07') {
            // Table already exists, skip
            console.log('Table already exists, skipping...');
          } else {
            console.error('Error executing statement:', error.message);
          }
        }
      }
    }
    
    // Add some sample data
    console.log('Adding sample data...');
    
    // Add sample publishers
    await pool.query(`
      INSERT INTO publishers (name, address, website, contact_email) VALUES 
      ('Penguin Books', 'London, UK', 'www.penguin.com', 'contact@penguin.com'),
      ('HarperCollins', 'New York, USA', 'www.harpercollins.com', 'info@harpercollins.com')
      ON CONFLICT DO NOTHING;
    `);
    
    // Add sample authors
    await pool.query(`
      INSERT INTO authors (name) VALUES 
      ('J.K. Rowling'),
      ('George R.R. Martin'),
      ('Stephen King')
      ON CONFLICT DO NOTHING;
    `);
    
    // Add sample categories
    await pool.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Fiction', 'Fictional literature'),
      ('Non-Fiction', 'Non-fictional literature'),
      ('Science Fiction', 'Science fiction books')
      ON CONFLICT DO NOTHING;
    `);
    
    // Add sample books
    await pool.query(`
      INSERT INTO books (title, description, isbn, publication_date, price, stock, discount, publisher_id) VALUES 
      ('Harry Potter and the Philosopher''s Stone', 'The first book in the Harry Potter series', '9780747532699', '1997-06-26', 29.99, 100, 0, 1),
      ('A Game of Thrones', 'The first book in A Song of Ice and Fire series', '9780553103540', '1996-08-01', 34.99, 75, 10, 2),
      ('The Shining', 'A horror novel by Stephen King', '9780385121675', '1977-01-28', 24.99, 50, 5, 2)
      ON CONFLICT DO NOTHING;
    `);
    
    // Add book-author relationships
    await pool.query(`
      INSERT INTO bookauthors (book_id, author_id) VALUES 
      (1, 1),
      (2, 2),
      (3, 3)
      ON CONFLICT DO NOTHING;
    `);
    
    // Add book-category relationships
    await pool.query(`
      INSERT INTO book_categories (book_id, category_id) VALUES 
      (1, 1),
      (2, 1),
      (3, 1)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
};

setupDatabase(); 