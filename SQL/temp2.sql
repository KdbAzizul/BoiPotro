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

INSERT INTO reviews (user_id, book_id, rating, comment, review_date) VALUES
-- Book 1
(1, 1, 5, 'This book helped me boost my sales dramatically.', NOW() - INTERVAL '7 days'),
(3, 1, 4, 'Great for beginners.', NOW() - INTERVAL '14 days'),
(6, 1, 4, 'Solid content, though some outdated tactics.', NOW() - INTERVAL '10 days'),

-- Book 2
(2, 2, 4, 'Nice picks. I found a few new favorites.', NOW() - INTERVAL '5 days'),
(5, 2, 3, 'Expected more analysis, but still useful.', NOW() - INTERVAL '9 days'),

-- Book 3
(4, 3, 5, 'SEO tips worked almost immediately.', NOW() - INTERVAL '3 days'),
(1, 3, 5, 'Really smart breakdowns for modern SEO.', NOW() - INTERVAL '6 days'),
(7, 3, 4, 'Good book, but assumes some prior knowledge.', NOW() - INTERVAL '11 days'),

-- Book 4
(8, 4, 5, 'Absolutely gripping!', NOW() - INTERVAL '2 days'),
(3, 4, 4, 'Engaging story and well-written.', NOW() - INTERVAL '15 days'),

-- Book 5
(2, 5, 5, 'My favorite book of the series.', NOW() - INTERVAL '8 days'),
(4, 5, 5, 'So many emotions! Amazing.', NOW() - INTERVAL '13 days'),
(9, 5, 4, 'Long but worth it.', NOW() - INTERVAL '4 days'),

-- Book 6
(6, 6, 4, 'A literary classic with sharp wit.', NOW() - INTERVAL '12 days'),
(1, 6, 3, 'Language was a bit tough, but rewarding.', NOW() - INTERVAL '16 days'),

-- Book 7
(10, 7, 4, 'Inspiring and thoughtful.', NOW() - INTERVAL '7 days'),
(3, 7, 3, 'Not quite as magical as I hoped.', NOW() - INTERVAL '6 days'),
(7, 7, 4, 'Beautiful message overall.', NOW() - INTERVAL '9 days'),

-- Book 8
(1, 8, 5, 'A masterpiece.', NOW() - INTERVAL '10 days'),
(5, 8, 5, 'Still powerful even decades later.', NOW() - INTERVAL '14 days'),
(2, 8, 4, 'Important and moving.', NOW() - INTERVAL '3 days'),

-- Book 9
(6, 9, 4, 'Dark themes, but beautifully written.', NOW() - INTERVAL '5 days'),
(8, 9, 3, 'Strange but compelling.', NOW() - INTERVAL '11 days'),

-- Book 10
(9, 10, 5, 'One of the best YA dystopias.', NOW() - INTERVAL '4 days'),
(10, 10, 4, 'Great world-building and action.', NOW() - INTERVAL '2 days'),
(3, 10, 4, 'Loved the main character.', NOW() - INTERVAL '6 days'),
(1, 10, 5, 'Couldn’t put it down.', NOW() - INTERVAL '12 days'),

-- Book 11
(4, 11, 5, 'Sharp satire with a powerful message.', NOW() - INTERVAL '7 days'),
(2, 11, 4, 'Short and punchy.', NOW() - INTERVAL '5 days'),

-- Book 12
(5, 12, 3, 'Didn’t connect with the character.', NOW() - INTERVAL '9 days'),
(6, 12, 4, 'Interesting coming-of-age story.', NOW() - INTERVAL '13 days'),

-- Book 13
(8, 13, 5, 'Incredibly insightful about how we think.', NOW() - INTERVAL '10 days'),
(1, 13, 5, 'Should be required reading.', NOW() - INTERVAL '7 days'),
(3, 13, 4, 'Dense but rewarding.', NOW() - INTERVAL '15 days'),

-- Book 14
(7, 14, 4, 'Very real and relatable.', NOW() - INTERVAL '6 days'),
(4, 14, 3, 'Some advice felt repetitive.', NOW() - INTERVAL '8 days'),

-- Book 15
(9, 15, 5, 'Terrifying but brilliant.', NOW() - INTERVAL '11 days'),
(2, 15, 4, 'Feels relevant today.', NOW() - INTERVAL '5 days'),
(10, 15, 5, 'Orwell was a prophet.', NOW() - INTERVAL '3 days');

INSERT INTO book_photos (book_id, photo_url, "order") VALUES
-- Book 1: How to Grow Your Online Store
(1, 'https://images-na.ssl-images-amazon.com/images/I/41FJhXOJXtL.SX331_BO1,204,203,200.jpg', 1),
(1, 'https://images-na.ssl-images-amazon.com/images/I/71e0kH8qvFL.jpg', 2),

-- Book 2: Top 10 Fiction Books This Year
(2, 'https://images-na.ssl-images-amazon.com/images/I/51QzNdDyB+L.SX331_BO1,204,203,200.jpg', 1),
(2, 'https://images-na.ssl-images-amazon.com/images/I/61zv8OyK9VL.jpg', 2),

-- Book 3: Mastering SEO in 2024
(3, 'https://images-na.ssl-images-amazon.com/images/I/41k5-vxRw7L.SX331_BO1,204,203,200.jpg', 1),
(3, 'https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg', 2),

-- Book 4: The Hunger Games
(4, 'https://images-na.ssl-images-amazon.com/images/I/61e0+AiN48L.jpg', 1),
(4, 'https://images-na.ssl-images-amazon.com/images/I/81OytVxG8gL.jpg', 2),
(4, 'https://images-na.ssl-images-amazon.com/images/I/81P3hnjJpGL.jpg', 3),

-- Book 5: Harry Potter and the Order of the Phoenix
(5, 'https://images-na.ssl-images-amazon.com/images/I/51NzHxiNB2L.SX342_BO1,204,203,200.jpg', 1),
(5, 'https://images-na.ssl-images-amazon.com/images/I/71y8P8lnUJL.jpg', 2),

-- Book 6: Pride and Prejudice
(6, 'https://images-na.ssl-images-amazon.com/images/I/51w8-GKxAxL.SX310_BO1,204,203,200.jpg', 1),
(6, 'https://images-na.ssl-images-amazon.com/images/I/91HHqVTAJQL.jpg', 2),

-- Book 7: The Alchemist
(7, 'https://images-na.ssl-images-amazon.com/images/I/41R8rEpc4VL.SX331_BO1,204,203,200.jpg', 1),
(7, 'https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg', 2),

-- Book 8: To Kill a Mockingbird
(8, 'https://images-na.ssl-images-amazon.com/images/I/51Gr0uO2HEL.SX307_BO1,204,203,200.jpg', 1),
(8, 'https://images-na.ssl-images-amazon.com/images/I/81OtwkiBfkL.jpg', 2),

-- Book 9: The Picture of Dorian Gray
(9, 'https://images-na.ssl-images-amazon.com/images/I/51hK0oMxUzL.SX324_BO1,204,203,200.jpg', 1),
(9, 'https://images-na.ssl-images-amazon.com/images/I/81L1X1rZ2UL.jpg', 2),

-- Book 10: Divergent
(10, 'https://images-na.ssl-images-amazon.com/images/I/51u6gPstHdL.SX332_BO1,204,203,200.jpg', 1),
(10, 'https://images-na.ssl-images-amazon.com/images/I/81s6DUyQCZL.jpg', 2),

-- Book 11: Animal Farm
(11, 'https://images-na.ssl-images-amazon.com/images/I/51-_4RJ0JwL.SX324_BO1,204,203,200.jpg', 1),
(11, 'https://images-na.ssl-images-amazon.com/images/I/81oDN4oU2-L.jpg', 2),

-- Book 12: The Catcher in the Rye
(12, 'https://images-na.ssl-images-amazon.com/images/I/51HclfdUFDL.SX307_BO1,204,203,200.jpg', 1),
(12, 'https://images-na.ssl-images-amazon.com/images/I/81WcnNQ-TBL.jpg', 2),

-- Book 13: Thinking, Fast and Slow
(13, 'https://images-na.ssl-images-amazon.com/images/I/41C3G8EPnZL.SX327_BO1,204,203,200.jpg', 1),
(13, 'https://images-na.ssl-images-amazon.com/images/I/81vpsIs58WL.jpg', 2),

-- Book 14: The Subtle Art of Not Giving a F*ck
(14, 'https://images-na.ssl-images-amazon.com/images/I/41YJXmo7RRL.SX322_BO1,204,203,200.jpg', 1),
(14, 'https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg', 2),

-- Book 15: 1984
(15, 'https://images-na.ssl-images-amazon.com/images/I/51HAlOXKUqL.SX314_BO1,204,203,200.jpg', 1),
(15, 'https://images-na.ssl-images-amazon.com/images/I/81AYK8unl-L.jpg', 2),
(15, 'https://images-na.ssl-images-amazon.com/images/I/81eI1BPzO1L.jpg', 3);





-- Publishers table
CREATE TABLE publishers (
id SERIAL PRIMARY KEY,
name VARCHAR(255),
address VARCHAR(2000),
website VARCHAR(255),
contact_email VARCHAR(255)
);

-- Payments table
CREATE TABLE payments (
id SERIAL PRIMARY KEY,
payment_date TIMESTAMP,
method VARCHAR(100)
);

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

INSERT INTO payments (payment_date, method) VALUES
('2025-06-01 10:15:00', 'bKash'),
('2025-06-02 14:30:00', 'Nagad'),
('2025-06-03 09:45:00', 'Rocket'),
('2025-06-04 16:20:00', 'Upay'),
('2025-06-05 11:00:00', 'bKash'),
('2025-06-06 13:10:00', 'Nagad'),
('2025-06-07 15:00:00', 'Rocket'),
('2025-06-08 10:30:00', 'Upay'),
('2025-06-09 12:40:00', 'bKash'),
('2025-06-10 09:55:00', 'Nagad');
