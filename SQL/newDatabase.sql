CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    publication_date DATE,
    price NUMERIC(6, 2),
    stock INTEGER,
    discount NUMERIC(5, 2),
    publisher_id INTEGER,
    FOREIGN KEY (publisher_id) REFERENCES publishers(id) -- assuming a publishers table exists
);
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE bookauthors (
    book_id INTEGER,
    author_id INTEGER,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- 1. Create tables

CREATE TABLE categories (
id SERIAL PRIMARY KEY,
name VARCHAR(255),
description VARCHAR(2000)
);

CREATE TABLE category_relations (
parent_id INT,
child_id INT,
PRIMARY KEY (parent_id, child_id),
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
FOREIGN KEY (child_id) REFERENCES categories(id) ON DELETE CASCADE
);



CREATE TABLE book_categories (
book_id INT,
category_id INT,
PRIMARY KEY (book_id, category_id),
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create coupons table
CREATE TABLE coupons (
id SERIAL PRIMARY KEY,
code VARCHAR(100) UNIQUE NOT NULL,
percentage_discount NUMERIC(5, 2) DEFAULT 0,
amount_discount NUMERIC(10, 2) DEFAULT 0,
maximum_discount NUMERIC(10, 2) DEFAULT 0,

min_order_amount NUMERIC(10, 2),
valid_from TIMESTAMP,
valid_until TIMESTAMP,
usage_limit INTEGER
);

-- Create user_coupons table
CREATE TABLE user_coupons (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
coupon_id INTEGER NOT NULL,
used_count INTEGER DEFAULT 0,
CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users(id),
CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);
INSERT INTO books (id, title, description, isbn, publication_date, price, stock, discount, publisher_id) VALUES
(1, 'How to Grow Your Online Store', 'Learn the best strategies to grow your online store in today''s competitive market.', '9780000000011', TO_DATE('2022-05-10', 'YYYY-MM-DD'), 19.99, 15, 10.00, 1),
(2, 'Top 10 Fiction Books This Year', 'A curated list of the best fiction books that are trending this year.', '9780000000012', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 14.99, 20, 0.00, 2),
(3, 'Mastering SEO in 2024', 'Tips and tricks to boost your SEO and rank higher on search engines.', '9780000000013', TO_DATE('2024-03-22', 'YYYY-MM-DD'), 29.99, 10, 5.00, 3),
(4, 'The Hunger Games', 'Could you survive on your own in the wild, with everyone out to get you?', '9780439023528', TO_DATE('2008-09-14', 'YYYY-MM-DD'), 16.99, 30, 0.00, 4),
(5, 'Harry Potter and the Order of the Phoenix', 'Harry Potter starts his fifth year at Hogwarts amid dark threats.', '9780439358071', TO_DATE('2003-06-21', 'YYYY-MM-DD'), 18.99, 12, 12.00, 5),
(6, 'Pride and Prejudice', 'The romantic clash between opinionated Elizabeth and proud Mr. Darcy.', '9780141040349', TO_DATE('1813-01-28', 'YYYY-MM-DD'), 10.99, 25, 0.00, 6),
(7, 'The Alchemist', 'A mystical story of a boy''s journey to find worldly treasure.', '9780061122415', TO_DATE('1993-05-01', 'YYYY-MM-DD'), 27.99, 18, 8.00, 7),
(8, 'To Kill a Mockingbird', 'The unforgettable novel of childhood and conscience in a southern town.', '9780060935467', TO_DATE('1960-07-11', 'YYYY-MM-DD'), 25.99, 20, 5.00, 8),
(9, 'The Picture of Dorian Gray', 'Oscar Wilde’s novel of beauty, corruption, and soul trade.', '9780141439570', TO_DATE('1890-06-20', 'YYYY-MM-DD'), 21.99, 11, 0.00, 9),
(10, 'Divergent', 'Beatrice must choose between staying with her family or finding herself.', '9780062024022', TO_DATE('2011-05-01', 'YYYY-MM-DD'), 12.99, 40, 0.00, 10),
(11, 'Animal Farm', 'A satirical tale about a group of farm animals who overthrow their human farmer.', '9780451526342', TO_DATE('1945-08-17', 'YYYY-MM-DD'), 14.99, 30, 5.00, 1),
(12, 'The Catcher in the Rye', 'The story of teenage angst and alienation as told by Holden Caulfield.', '9780316769488', TO_DATE('1951-07-16', 'YYYY-MM-DD'), 10.99, 18, 0.00, 3),
(13, 'Thinking, Fast and Slow', 'Daniel Kahneman''s exploration of the two systems that drive the way we think.', '9780374533557', TO_DATE('2011-10-25', 'YYYY-MM-DD'), 16.99, 17, 10.00, 3),
(14, 'The Subtle Art of Not Giving a F*ck', 'Mark Manson offers raw and honest advice for living a better life.', '9780062457714', TO_DATE('2016-09-13', 'YYYY-MM-DD'), 17.99, 19, 0.00, 6),
(15, '1984', 'A chilling vision of a totalitarian regime that uses surveillance and mind control.', '9780451524935', TO_DATE('1949-06-08', 'YYYY-MM-DD'), 16.99, 25, 15.00, 1);
INSERT INTO authors (id, name) VALUES
(1, 'Sarah Johnson'),
(2, 'James Peterson'),
(3, 'Rhiannon Frater'),
(4, 'Suzanne Collins'),
(5, 'J.K. Rowling'),
(6, 'Jane Austen'),
(7, 'Harper Lee'),
(8, 'John Green'),
(9, 'Oscar Wilde'),
(10, 'Lewis Carroll'),
(11, 'Paulo Coelho'),
(12, 'Rick Riordan');

INSERT INTO bookauthors (book_id, author_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 11),
(8, 7),
(9, 9),
(10, 12),
(11, 3),
(12, 8),
(13, 2),
(14, 2),
(15, 1),

-- Example multiple authors for some books:
(1, 2),  -- book 1 also by author 2
(5, 9),  -- book 5 also by author 9
(9, 10), -- book 9 also by author 10
(13, 5); -- book 13 also by author 5



-- 2. Insert categories

INSERT INTO categories (id, name, description) VALUES
(1, 'Fiction', 'Fictional books'),
(2, 'Science Fiction', 'Sci-Fi category under Fiction'),
(3, 'Fantasy', 'Fantasy category under Fiction'),
(4, 'Non-Fiction', 'Non-fictional books'),
(5, 'Biography', 'Biographies and autobiographies');

-- 3. Insert category relations (hierarchy)

INSERT INTO category_relations (parent_id, child_id) VALUES
(1, 2), -- Fiction → Science Fiction
(1, 3), -- Fiction → Fantasy
(4, 5); -- Non-Fiction → Biography



INSERT INTO book_categories (book_id, category_id) VALUES
-- Non-Fiction
(1, 4), -- How to Grow Your Online Store
(3, 4), -- Mastering SEO in 2024
(13, 4), -- Thinking, Fast and Slow
(14, 4), -- The Subtle Art of Not Giving a F*ck

-- Fiction List
(2, 1), -- Top 10 Fiction Books This Year

-- Fiction books and subgenres
(4, 2), -- The Hunger Games (Science Fiction)
(5, 3), -- Harry Potter (Fantasy)
(6, 1), -- Pride and Prejudice (Fiction)
(7, 1), -- The Alchemist (Fiction)
(8, 1), -- To Kill a Mockingbird (Fiction)
(9, 1), -- The Picture of Dorian Gray (Fiction)
(10, 2), -- Divergent (Science Fiction)
(11, 1), -- Animal Farm (Fiction)
(12, 1), -- The Catcher in the Rye (Fiction)
(15, 2); -- 1984 (Science Fiction)

-- Insert demo data into coupons
INSERT INTO coupons (code, percentage_discount, amount_discount, maximum_discount, min_order_amount, valid_from, valid_until, usage_limit)
VALUES
('SUMMER20', 20.00, 0, 100.00, 50.00, '2025-06-01 00:00:00', '2025-06-30 23:59:59', 100),
('FIFTYOFF', 0, 50.00, 50.00, 100.00, '2025-06-01 00:00:00', '2025-12-31 23:59:59', 50),
('WELCOME10', 10.00, 0, 30.00, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL);

-- Insert demo data into user_coupons with multiple coupons per user (users 1 to 10)
INSERT INTO user_coupons (user_id, coupon_id, used_count) VALUES
(1, 1, 0),
(1, 3, 1),
(2, 2, 1),
(2, 3, 0),
(3, 1, 2),
(3, 2, 0),
(4, 1, 0),
(4, 3, 1),
(5, 2, 2),
(5, 3, 0),
(6, 1, 0),
(6, 2, 1),
(7, 3, 0),
(7, 1, 1),
(8, 2, 3),
(8, 3, 0),
(9, 1, 0),
(9, 2, 2),
(10, 1, 1),
(10, 3, 0);