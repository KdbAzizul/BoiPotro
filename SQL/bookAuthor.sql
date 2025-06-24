K M Fahim Hossain:
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