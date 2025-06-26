
CREATE TABLE publishers (
id SERIAL PRIMARY KEY,
name VARCHAR(255),
address VARCHAR(2000),
website VARCHAR(255),
contact_email VARCHAR(255)
);

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
    FOREIGN KEY (publisher_id) REFERENCES publishers(id) 
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

CREATE TABLE users (
    ID          SERIAL PRIMARY KEY,
    Name        VARCHAR(100) NOT NULL,
    EMAIL       VARCHAR(100) NOT NULL,
    password    VARCHAR(1024) NOT NULL,
    address     VARCHAR(1000),
    PHONE       VARCHAR(20),
    DOB         VARCHAR(20),
    IMAGE       VARCHAR(1000) DEFAULT '/images/no-profile-picture.jpg',
    isAdmin     BOOLEAN DEFAULT FALSE
);

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

CREATE TABLE user_coupons (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
coupon_id INTEGER NOT NULL,
used_count INTEGER DEFAULT 0,
CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users(id),
CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

CREATE TABLE payments (
id SERIAL PRIMARY KEY,
payment_date TIMESTAMP,
method VARCHAR(100)
);

CREATE TABLE cart (
    ID              SERIAL PRIMARY KEY,
    user_id         INTEGER,
    coupon_id      INTEGER,
    total_price     NUMERIC,
    total_item      INTEGER,
    shipping_address  VARCHAR(1000),
    state           VARCHAR(50),
    payment_id  INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(ID),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE TABLE cartItems (
    ID         SERIAL PRIMARY KEY,
    cart_id    INTEGER,
    book_id    INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity     INTEGER DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES cart(ID),
    FOREIGN KEY (book_id) REFERENCES books(ID),
    CONSTRAINT picked_amount_min_max_value CHECK (quantity BETWEEN 1 AND 5)

);

CREATE TABLE reviews (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
book_id INTEGER NOT NULL,
rating INTEGER CHECK (rating BETWEEN 1 AND 5),
comment TEXT,
review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE book_photos (
id SERIAL PRIMARY KEY,
book_id INTEGER NOT NULL,
photo_url VARCHAR(500) NOT NULL,
photo_order INTEGER,
CONSTRAINT fk_bphotos_book FOREIGN KEY (book_id) REFERENCES books(id)
);







INSERT INTO users (ID, NAME, PASSWORD, ADDRESS, EMAIL, DOB, PHONE, isAdmin)
VALUES 
(88, 'Azizul Hakim', '$2b$08$PSyjwxvcW53OZ/whRpRW.eI7G2w9CnLU/xJ1VQOUlCgrvxfGlOhzW', 'Ahsanullah Hall, BUET', 'azizul@gmail.com', NULL, '01844921505', FALSE),
(90, 'Fahim Hossain', '$2b$08$xnuPq9ALDxEqf/MzFGytXe00DiCKAnEGdT2/jBuWeZk6CjudCgBT2', 'Titumir Hall, BUET', 'fahim@gmail.com', '2007-09-13', '01844921590', TRUE),
(67, 'Adil', '$2b$08$U9ZjxgyNFZt07IBQmLtwx.XGVBTWzfGL1DHwlWYsgBlcd7xXmOUbS', 'user.address', 'adil@gmail.com', NULL, NULL, FALSE),
(101, 'Abid', '$2b$08$nkFP1HjzscuCrtBCCEKUj.Jb.vUDi5P.H2uLlYQLHVurHaUjf.OEC', 'user.address', 'abid@gmail.com', '1999-12-14', NULL, FALSE),
(141, 'Safwan', '$2b$08$KS9iYlr4J1IY6dszmMM9r.ZSgwLJo6MZMpesmRGaj1eFGDhzD/bEG', 'user.address', 'safwan@gmail.com', NULL, NULL, FALSE),
(81, 'Fuad', '$2b$08$kzsveDbaY0zIDaJuM8jNleb0fjnuPqA3Zg2wddng/E9XeDL2io2um', 'user.address', 'fuad@gmail.com', NULL, NULL, FALSE),
(24, 'Tonmoy', '$2b$08$yjfaNI6q9ST1VnfxnC5cY.DM8dBzeeG.FlyF7hwovRg/DqhauEmPy', 'user.address', 'tonmoy@gmail.com', '1999-02-19', '01723218292', FALSE),
(121, 'Tasirul Umor', '$2b$08$Yq6CZekcB7rHOsxpczPz1ek1LRXsNZSPe/r8Gw10uIWgDFIEdL30a', 'user.address', 'umor@gmail.com', NULL, NULL, FALSE),
(122, 'Pavel', '$2b$08$KqSvtKu4t8IMbfBUFXhE0.kl17497/zTEpadcidY0rb.JKzsky3Oq', 'user.address', 'pavel@gmail.com', NULL, NULL, FALSE),
(123, 'Bayazid', '$2b$08$27ZNAr6pydiuNqf5kwcaYewcjOoym6LEgrgb6OPNyvCzkWw.HJdDy', 'user.address', 'bayazid@gmail.com', NULL, NULL, FALSE);




INSERT INTO publishers (id, name, address, website, contact_email) VALUES
(1, 'Global Books Publishing', '123 Book St, New York, NY', 'https://globalbooks.com', 'contact@globalbooks.com'),
(2, 'Fiction House', '456 Novel Ave, Boston, MA', 'https://fictionhouse.com', 'info@fictionhouse.com'),
(3, 'SEO Publishers', '789 Marketing Blvd, San Francisco, CA', 'https://seopublishers.com', 'support@seopublishers.com'),
(4, 'Wildfire Books', '101 Adventure Rd, Denver, CO', 'https://wildfirebooks.com', 'hello@wildfirebooks.com'),
(5, 'Wizardry Press', '202 Magic Ln, London, UK', 'https://wizardrypress.co.uk', 'contact@wizardrypress.co.uk'),
(6, 'Classic Reads Ltd.', '303 Heritage St, Edinburgh, UK', 'https://classicreads.com', 'info@classicreads.com'),
(7, 'Mystic Tales Publishing', '404 Quest Way, Austin, TX', 'https://mystictales.com', 'support@mystictales.com'),
(8, 'Southern Story House', '505 Memory Dr, Atlanta, GA', 'https://southernstoryhouse.com', 'contact@southernstoryhouse.com'),
(9, 'Oscar Wilde Press', '606 Literature Ln, Dublin, Ireland', 'https://oscarwildepress.ie', 'info@oscarwildepress.ie'),
(10, 'Future Fiction Corp', '707 Tomorrow St, Seattle, WA', 'https://futurefiction.com', 'support@futurefiction.com');


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
(15, '1984', 'A chilling vision of a totalitarian regime that uses surveillance and mind control.', '9780451524935', TO_DATE('1949-06-08', 'YYYY-MM-DD'), 16.99, 25, 15.00, 1),
(16, 'Deep Work', 'Rules for focused success in a distracted world.', '9781455586691', TO_DATE('2016-01-05', 'YYYY-MM-DD'), 15.99, 22, 5.00, 6),
(17, 'Atomic Habits', 'An easy and proven way to build good habits and break bad ones.', '9780735211292', TO_DATE('2018-10-16', 'YYYY-MM-DD'), 20.99, 27, 3.00, 3),
(18, 'Educated', 'A memoir by Tara Westover about growing up in a strict and abusive household.', '9780399590504', TO_DATE('2018-02-20', 'YYYY-MM-DD'), 18.99, 14, 0.00, 4),
(19, 'Sapiens', 'A brief history of humankind.', '9780062316097', TO_DATE('2015-02-10', 'YYYY-MM-DD'), 22.99, 16, 7.00, 7),
(20, 'The Psychology of Money', 'Timeless lessons on wealth, greed, and happiness.', '9780857197689', TO_DATE('2020-09-01', 'YYYY-MM-DD'), 19.49, 21, 2.50, 8);

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
(12, 'Rick Riordan')
(13, 'Cal Newport'),
(14, 'James Clear'),
(15, 'Tara Westover'),
(16, 'Yuval Noah Harari'),
(17, 'Morgan Housel');

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
(1, 2),  
(5, 9),  
(9, 10),
(13, 5),
(16, 13), -- Deep Work
(17, 14), -- Atomic Habits
(18, 15), -- Educated
(19, 16), -- Sapiens
(20, 17); -- Psychology of Money





INSERT INTO categories (id, name, description) VALUES
(1, 'Fiction', 'Fictional books'),
(2, 'Science Fiction', 'Sci-Fi category under Fiction'),
(3, 'Fantasy', 'Fantasy category under Fiction'),
(4, 'Non-Fiction', 'Non-fictional books'),
(5, 'Biography', 'Biographies and autobiographies');



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
(15, 2), -- 1984 (Science Fiction)
(16, 4), -- Deep Work → Non-Fiction
(17, 4), -- Atomic Habits → Non-Fiction
(18, 5), -- Educated → Biography
(19, 4), -- Sapiens → Non-Fiction
(20, 4); -- Psychology of Money → Non-Fiction;

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



INSERT INTO reviews (user_id, book_id, rating, comment, review_date) VALUES
-- Book 1
(88, 1, 5, 'This book helped me boost my sales dramatically.', NOW() - INTERVAL '7 days'),
(90, 1, 4, 'Great for beginners.', NOW() - INTERVAL '14 days'),
(67, 1, 4, 'Solid content, though some outdated tactics.', NOW() - INTERVAL '10 days'),

-- Book 2
(101, 2, 4, 'Nice picks. I found a few new favorites.', NOW() - INTERVAL '5 days'),
(88, 2, 3, 'Expected more analysis, but still useful.', NOW() - INTERVAL '9 days'),

-- Book 3
(88, 3, 5, 'SEO tips worked almost immediately.', NOW() - INTERVAL '3 days'),
(67, 3, 5, 'Really smart breakdowns for modern SEO.', NOW() - INTERVAL '6 days'),
(90, 3, 4, 'Good book, but assumes some prior knowledge.', NOW() - INTERVAL '11 days'),

-- Book 4
(88, 4, 5, 'Absolutely gripping!', NOW() - INTERVAL '2 days'),
(90, 4, 4, 'Engaging story and well-written.', NOW() - INTERVAL '15 days'),

-- Book 5
(24, 5, 5, 'My favorite book of the series.', NOW() - INTERVAL '8 days'),
(67, 5, 5, 'So many emotions! Amazing.', NOW() - INTERVAL '13 days'),
(101, 5, 4, 'Long but worth it.', NOW() - INTERVAL '4 days'),

-- Book 6
(88, 6, 4, 'A literary classic with sharp wit.', NOW() - INTERVAL '12 days'),
(90, 6, 3, 'Language was a bit tough, but rewarding.', NOW() - INTERVAL '16 days'),

-- Book 7
(81, 7, 4, 'Inspiring and thoughtful.', NOW() - INTERVAL '7 days'),
(88, 7, 3, 'Not quite as magical as I hoped.', NOW() - INTERVAL '6 days'),
(101, 7, 4, 'Beautiful message overall.', NOW() - INTERVAL '9 days'),

-- Book 8
(24, 8, 5, 'A masterpiece.', NOW() - INTERVAL '10 days'),
(101, 8, 5, 'Still powerful even decades later.', NOW() - INTERVAL '14 days'),
(88, 8, 4, 'Important and moving.', NOW() - INTERVAL '3 days'),

-- Book 9
(101, 9, 4, 'Dark themes, but beautifully written.', NOW() - INTERVAL '5 days'),
(121, 9, 3, 'Strange but compelling.', NOW() - INTERVAL '11 days'),

-- Book 10
(121, 10, 5, 'One of the best YA dystopias.', NOW() - INTERVAL '4 days'),
(122, 10, 4, 'Great world-building and action.', NOW() - INTERVAL '2 days'),
(24, 10, 4, 'Loved the main character.', NOW() - INTERVAL '6 days'),
(90, 10, 5, 'Couldn’t put it down.', NOW() - INTERVAL '12 days'),

-- Book 11
(88, 11, 5, 'Sharp satire with a powerful message.', NOW() - INTERVAL '7 days'),
(90, 11, 4, 'Short and punchy.', NOW() - INTERVAL '5 days'),

-- Book 12
(90, 12, 3, 'Didn’t connect with the character.', NOW() - INTERVAL '9 days'),
(121, 12, 4, 'Interesting coming-of-age story.', NOW() - INTERVAL '13 days'),

-- Book 13
(123, 13, 5, 'Incredibly insightful about how we think.', NOW() - INTERVAL '10 days'),
(81, 13, 5, 'Should be required reading.', NOW() - INTERVAL '7 days'),
(67, 13, 4, 'Dense but rewarding.', NOW() - INTERVAL '15 days'),

-- Book 14
(67, 14, 4, 'Very real and relatable.', NOW() - INTERVAL '6 days'),
(24, 14, 3, 'Some advice felt repetitive.', NOW() - INTERVAL '8 days'),

-- Book 15
(88, 15, 5, 'Terrifying but brilliant.', NOW() - INTERVAL '11 days'),
(90, 15, 4, 'Feels relevant today.', NOW() - INTERVAL '5 days'),
(101, 15, 5, 'Orwell was a prophet.', NOW() - INTERVAL '3 days');

INSERT INTO book_photos (book_id, photo_url, "order") VALUES
-- Book 1: How to Grow Your Online Store
(1, 'https://m.media-amazon.com/images/I/61om39k02LL._UF1000,1000_QL80_.jpg', 1),

-- Book 2: Top 10 Fiction Books This Year
(2, 'https://tolstoytherapy.com/wp-content/uploads/2022/09/51QQRmnMwDL.jpeg', 1),


-- Book 3: Mastering SEO in 2024
(3, 'https://m.media-amazon.com/images/I/61cEWkgGBuL._AC_UF1000,1000_QL80_.jpg', 1),


-- Book 4: The Hunger Games
(4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722975i/2767052.jpg', 1),


-- Book 5: Harry Potter and the Order of the Phoenix
(5, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546910265i/2.jpg', 1),


-- Book 6: Pride and Prejudice
(6, 'https://m.media-amazon.com/images/I/81Scutrtj4L._UF1000,1000_QL80_.jpg', 1),


-- Book 7: The Alchemist
(7, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnL-QW9YcIncWPqchZ7958cvI8H5uQBrIaUQ&s', 1),


-- Book 8: To Kill a Mockingbird
(8, 'https://cdn.britannica.com/21/182021-050-666DB6B1/book-cover-To-Kill-a-Mockingbird-many-1961.jpg?w=300', 1),


-- Book 9: The Picture of Dorian Gray
(9, 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781625587534/the-picture-of-dorian-gray-9781625587534_hr.jpg', 1),


-- Book 10: Divergent
(10, 'https://bookowlsbd.com/cdn/shop/files/images--_2024-09-22T120611.457.jpg?v=1726985197', 1),


-- Book 11: Animal Farm
(11, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH3DwfAkuoYOmwD8P3gxHVA8o1uQUO4OpPKQ&s', 1),


-- Book 12: The Catcher in the Rye
(12, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVdPsvFMMqa0HJGRWfEcfcxDQ4v3XJ1VcPRA&s', 1),


-- Book 13: Thinking, Fast and Slow
(13, 'https://static-01.daraz.com.bd/p/1517c6d2c504b12929c203e59b63508f.jpg', 1),


-- Book 14: The Subtle Art of Not Giving a F*ck
(14, 'https://static1.squarespace.com/static/5fc9fa0d212d07164335923e/5fd03a513bcf75077a7ba69c/633274f5d7d2333a5979bcab/1664251249355/The+Subtle+art+of+not+giving+a+fuck.jpg?format=1500w', 1),


-- Book 15: 1984
(15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8Ds-5e53IDjlLgBmyRRNIx9g46Pos-sRwtg&s', 1),

(16, 'https://static-01.daraz.com.bd/p/3176d2661882d162074e1f97c4b59b77.jpg', 1),
(17, 'https://static-01.daraz.com.bd/p/260f3cd1cdf2a62cbcb2dfe8558129e2.jpg', 1),
(18, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg', 1),
(19, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtSH2BYZfQJnwHmkZxMtMXRGVAqsTGyomDAw&s', 1),
(20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMO9ageau3VJ7SiXbE41dnLtQz-ZKBXQtwPQ&s', 1);
