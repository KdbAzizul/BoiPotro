-- First JSON array
INSERT INTO book (author_id, publisher_id, NAME, IMAGE, ISBN, PAGE, EDITION, publishing_year, Price, Stock, Language, GENRE, SUMMARY, STAR, REVIEW_COUNT) VALUES
(1, 1, 'How to Grow Your Online Store', 'https://m.media-amazon.com/images/I/71sY9xq06hL._SL1500_.jpg', '9780000000011', 220, '1st', 2022, 19.99, 15, 'English', 'Business', 'Learn the best strategies to grow your online store in today''s competitive market.', 4.2, 124),
(2, 2, 'Top 10 Fiction Books This Year', 'https://m.media-amazon.com/images/I/81iqZ2HHD-L.jpg', '9780000000012', 180, '1st', 2024, 14.99, 20, 'English', 'Books', 'A curated list of the best fiction books that are trending this year.', 4.5, 98),
(3, 3, 'Mastering SEO in 2024', 'https://m.media-amazon.com/images/I/61pHYmN9W1L._SL1000_.jpg', '9780000000013', 310, '2nd', 2024, 29.99, 10, 'English', 'Marketing', 'Tips and tricks to boost your SEO and rank higher on search engines.', 4.0, 72),
(4, 4, 'The Hunger Games', 'https://m.media-amazon.com/images/I/41S0bD6YyGL._SX331_BO1,204,203,200_.jpg', '9780439023528', 384, '1st', 2008, 16.99, 30, 'English', 'Fiction', 'Could you survive on your own in the wild, with everyone out to get you?', 4.8, 1523),
(5, 5, 'Harry Potter and the Order of the Phoenix', 'https://m.media-amazon.com/images/I/51myhyymMfL.jpg', '9780439358071', 896, '1st', 2003, 18.99, 12, 'English', 'Adventure', 'Harry Potter starts his fifth year at Hogwarts amid dark threats.', 4.9, 3500),
(6, 6, 'Pride and Prejudice', 'https://m.media-amazon.com/images/I/81s6DUyQCZL.jpg', '9780141040349', 279, '3rd', 1813, 10.99, 25, 'English', 'Fiction', 'The romantic clash between opinionated Elizabeth and proud Mr. Darcy.', 4.6, 2201),
(7, 7, 'The Alchemist', 'https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg', '9780061122415', 208, '1st', 1993, 27.99, 18, 'English', 'Adventure', 'A mystical story of a boy''s journey to find worldly treasure.', 4.7, 3122),
(8, 8, 'To Kill a Mockingbird', 'https://m.media-amazon.com/images/I/81OdwZ9UQPL.jpg', '9780060935467', 336, '1st', 1960, 25.99, 20, 'English', 'Fiction', 'The unforgettable novel of childhood and conscience in a southern town.', 4.9, 4500),
(9, 9, 'The Picture of Dorian Gray', 'https://m.media-amazon.com/images/I/61sh7sHq+uL._SL1000_.jpg', '9780141439570', 304, '2nd', 1890, 21.99, 11, 'English', 'Horror', 'Oscar Wilde’s novel of beauty, corruption, and soul trade.', 4.4, 1400),
(10, 10, 'Divergent', 'https://m.media-amazon.com/images/I/81zS4WSpv5L.jpg', '9780062024022', 487, '1st', 2011, 12.99, 40, 'English', 'Business', 'Beatrice must choose between staying with her family or finding herself.', 4.3, 980);

-- Second JSON array
INSERT INTO book (ID, author_id, publisher_id, NAME, IMAGE, ISBN, PAGE, EDITION, publishing_year, Price, Stock, Language, GENRE, SUMMARY, STAR, REVIEW_COUNT) VALUES
(21, 1, 1, 'Animal Farm', 'https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg', '9780451526342', 112, '1st', 1945, 15.99, 20, 'English', 'Political Satire', 'A powerful allegory about totalitarianism, revolution, and corruption, written by George Orwell.', 4.7, 8123),
(22, 3, 2, 'The Catcher in the Rye', 'https://images-na.ssl-images-amazon.com/images/I/81OthjkJBuL.jpg', '9780316769488', 277, '1st', 1951, 10.99, 18, 'English', 'Fiction', 'The story of teenage angst and alienation as told by Holden Caulfield, a 16-year-old boy wandering New York City.', 4.5, 6700),
(23, 4, 3, 'Thinking, Fast and Slow', 'https://images-na.ssl-images-amazon.com/images/I/71MwBLT0i8L.jpg', '9780374533557', 499, '2nd', 2011, 17.99, 10, 'English', 'Psychology, Non-fiction', 'Daniel Kahneman''s exploration of the two systems that drive the way we think: fast and intuitive, and slow and deliberate.', 4.8, 10456),
(24, 5, 4, 'The Subtle Art of Not Giving a F*ck', 'https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg', '9780062457714', 224, '1st', 2016, 22.99, 14, 'English', 'Self-help', 'Mark Manson cuts through the clichés of the self-help genre with his brutally honest advice.', 4.6, 9320),
(25, 1, 1, '1984', 'https://images-na.ssl-images-amazon.com/images/I/81AYR7zv0HL.jpg', '9780451524935', 328, '1st', 1949, 16.99, 25, 'English', 'Dystopian Fiction', 'A chilling vision of a totalitarian regime that uses surveillance and mind control to dominate its citizens.', 4.9, 12000);
INSERT INTO BOOK (author_id, publisher_id, NAME, IMAGE, ISBN, PAGE, EDITION, publishing_year, Price, Stock, Language, GENRE, SUMMARY, STAR, REVIEW_COUNT) VALUES
(1, 1, 'Animal Farm', 'https://images-na.ssl-images-amazon.com/images/I/81BzBvC0Q+L.jpg', '9780451526342', 144, '1st', 1945, 14.99, 30, 'English', 'Political Satire', 'A satirical tale about a group of farm animals who overthrow their human farmer.', 4.8, 9500),
(2, 1, 'Brave New World', 'https://m.media-amazon.com/images/I/71sBtM3Yi5L.jpg', '9780060850524', 268, '1st', 1932, 15.99, 18, 'English', 'Science Fiction', 'A futuristic vision of a totalitarian society controlled by technology and conditioning.', 4.6, 8600),
(3, 2, 'Sapiens: A Brief History of Humankind', 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg', '9780062316097', 443, '1st', 2011, 22.99, 22, 'English', 'History', 'Yuval Noah Harari explores the history of humankind from the Stone Age to the modern day.', 4.7, 15400),
(4, 3, 'Educated', 'https://m.media-amazon.com/images/I/81WojUxbbFL.jpg', '9780399590504', 352, '1st', 2018, 18.99, 14, 'English', 'Memoir', 'Tara Westover''s memoir about growing up in a survivalist family and pursuing education.', 4.8, 20000),
(5, 3, 'Atomic Habits', 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg', '9780735211292', 320, '1st', 2018, 20.99, 40, 'English', 'Self-Help', 'James Clear’s guide to breaking bad habits and building good ones.', 4.9, 25000),
(3, 1, 'Thinking, Fast and Slow', 'https://m.media-amazon.com/images/I/71pN4g+cTaL.jpg', '9780374533557', 512, '1st', 2011, 16.99, 17, 'English', 'Psychology', 'Daniel Kahneman''s examination of the two systems that drive the way we think.', 4.5, 13200),
(6, 4, 'The Subtle Art of Not Giving a F*ck', 'https://m.media-amazon.com/images/I/71QKQ9mwV7L.jpg', '9780062457714', 224, '1st', 2016, 17.99, 19, 'English', 'Self-Help', 'Mark Manson offers raw and honest advice for living a better life by caring less.', 4.3, 14000),
(5, 2, 'Deep Work', 'https://m.media-amazon.com/images/I/81vpsIs58WL.jpg', '9781455586691', 304, '1st', 2016, 19.99, 11, 'English', 'Productivity', 'Cal Newport explains how to focus without distraction in a noisy world.', 4.7, 11500),
(2, 4, 'Start With Why', 'https://m.media-amazon.com/images/I/71g2ednj0JL.jpg', '9781591846444', 256, '1st', 2009, 21.99, 12, 'English', 'Leadership', 'Simon Sinek explains how leaders can inspire cooperation and change.', 4.6, 9200),
(4, 1, 'The Power of Habit', 'https://m.media-amazon.com/images/I/81QpkIctqPL.jpg', '9780812981605', 371, '1st', 2012, 18.99, 10, 'English', 'Self-Help', 'Charles Duhigg delves into the science of habit formation and change.', 4.5, 11000),
(6, 3, 'Can''t Hurt Me', 'https://m.media-amazon.com/images/I/71UypkUjStL.jpg', '9781544512273', 364, '1st', 2018, 22.99, 13, 'English', 'Biography', 'David Goggins'' memoir of transformation through extreme discipline and mental toughness.', 4.9, 16000),
(3, 4, 'Man’s Search for Meaning', 'https://m.media-amazon.com/images/I/71M7E+CwYNL.jpg', '9780807014295', 200, '1st', 1946, 14.99, 16, 'English', 'Philosophy', 'Viktor Frankl''s reflection on his time in Nazi death camps and lessons for spiritual survival.', 4.9, 17000),
(1, 2, 'Meditations', 'https://m.media-amazon.com/images/I/81EuZ9zR4oL.jpg', '9780140449334', 256, '1st', 180, 12.99, 20, 'English', 'Philosophy', 'Marcus Aurelius’ collection of personal writings and Stoic wisdom.', 4.8, 10500),
(4, 4, 'The 7 Habits of Highly Effective People', 'https://m.media-amazon.com/images/I/81bG1AD8JuL.jpg', '9780743269513', 381, '1st', 1989, 21.99, 15, 'English', 'Personal Development', 'Stephen Covey’s classic guide to personal and professional effectiveness.', 4.7, 14000),
(2, 3, 'The Psychology of Money', 'https://m.media-amazon.com/images/I/71g2ednj0JL.jpg', '9780857197689', 256, '1st', 2020, 19.99, 18, 'English', 'Finance', 'Morgan Housel explores how people think about money and how it impacts our decisions.', 4.8, 12300);





authors:

INSERT INTO AUTHOR (ID, Name, password, IMAGE, DESCRIPTION) VALUES
(1, 'Sarah Johnson', '$2a$10$7G2TnUuCzvI3XqZvY8L3eeJ9ZbWJoXZht7O7hf9Rm1XHeV6cv.uGa', 'https://randomuser.me/api/portraits/women/44.jpg', 'Sarah is an eCommerce strategist and speaker, passionate about helping small businesses scale online.'),
(2, 'James Peterson', '$2a$10$ZktNSm1ajY7gKv/Mb0t.8uHb9E4xCZqHZfWvZMiU99gKZ9yZCPtW2', 'https://randomuser.me/api/portraits/men/32.jpg', 'James is a marketing consultant specializing in SEO and digital growth techniques.'),
(3, 'Rhiannon Frater', '$2a$10$mvKyJXYf89RIaJX6qOwS9eGf13NScQ6vnYFghSbdz9zRpZolq0.Oi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Rhiannon_Frater_%282014%29.jpg/640px-Rhiannon_Frater_%282014%29.jpg', 'Rhiannon Frater is a horror fiction author best known for her zombie apocalypse novels.'),
(4, 'Suzanne Collins', '$2a$10$AaGzWzEjShpG9G9KdZjSPu8hF0yNnS.ZY1Fv6/TxW2hPLJkK7YB9i', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Suzanne_Collins_%282019%29.jpg/800px-Suzanne_Collins_%282019%29.jpg', 'Suzanne is an American television writer and author, best known for The Hunger Games trilogy.'),
(5, 'J.K. Rowling', '$2a$10$Qx7d8fsI9dd8vs9qG7pXZefytZrPShEoD9nMjfh3Bn5ffzY9uqTgS', 'https://upload.wikimedia.org/wikipedia/commons/5/5d/J._K._Rowling_2010.jpg', 'British author, philanthropist, film producer, and screenwriter best known for writing the Harry Potter fantasy series.'),
(6, 'Jane Austen', '$2a$10$fKz8YsaP3k0KcvP4pJ6pCuYj6Nl9OC8aIETuzPvQgUu0nHvZLzMne', 'https://upload.wikimedia.org/wikipedia/commons/c/cd/CassandraAusten-JaneAusten%28c.1810%29_hires.jpg', 'English novelist known primarily for her six major novels including Pride and Prejudice.'),
(7, 'Harper Lee', '$2a$10$D3QziMtGgsA3B3smLkvHcuRv6PrdjfdtAsM/XI20eOGWJ1vZHXVDa', 'https://upload.wikimedia.org/wikipedia/en/7/79/Harper_Lee_Novelist.jpg', 'Harper Lee was an American novelist best known for her novel ''To Kill a Mockingbird''.'),
(8, 'John Green', '$2a$10$uyJhTzqv8FxBQ5A9mQJvde28EjHfrbpHdRtqz6Y4Th0/YhxONch1e', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/John_Green_2014_2.jpg/800px-John_Green_2014_2.jpg', 'John Green is an American author and YouTube content creator, known for ''The Fault in Our Stars''.'),
(9, 'Oscar Wilde', '$2a$10$12fsdG6XJ72wHbf8q9Nt0euQlCgXWv6mzRGEDj4eMZBLTtZcZ7mcW', 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Oscar_Wilde_portrait.jpg', 'Irish poet and playwright, best known for his novel ''The Picture of Dorian Gray''.'),
(10, 'Lewis Carroll', '$2a$10$z8g4fPzhD7fMIY/RyF/1eegUl8WDGhcDC0U4oKDhqZtw9TRaBThK6', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Lewis_Carroll_Self_Portrait_1857_circa.jpg', 'Author of ''Alice’s Adventures in Wonderland'', Carroll was also a mathematician and logician.'),
(11, 'Paulo Coelho', '$2a$10$grz7mFasLo.W1EexOcL2CeOy7TPsJWl.Xd5gUjCqNKliCnOJJBevC', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Paulo_Coelho_2014.jpg/800px-Paulo_Coelho_2014.jpg', 'Paulo Coelho is a Brazilian author famous for his bestselling novel ''The Alchemist''.'),
(12, 'Rick Riordan', '$2a$10$sb9nEQaKkvU86Wj90o5R7e7eTpTvWbzFmqx7dXkgPyQ5sRI8r9h7K', 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Rickriordan.jpg', 'American author known for writing the Percy Jackson & the Olympians series.');


publications:

INSERT INTO publisher (ID, Name, IMAGE, DESCRIPTION) VALUES
(1, 'Penguin Random House', 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Penguin_Random_House_logo.svg/1200px-Penguin_Random_House_logo.svg.png', 'One of the largest publishing companies in the world, known for a wide range of bestsellers across genres.'),
(2, 'HarperCollins', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/HarperCollins_logo.svg/1200px-HarperCollins_logo.svg.png', 'Global publisher of fiction, non-fiction, children’s books, and reference works.'),
(3, 'Simon & Schuster', 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/Simon_%26_Schuster_logo.svg/1280px-Simon_%26_Schuster_logo.svg.png', 'American publishing company founded in 1924, known for a wide variety of authors and bestsellers.'),
(4, 'Bloomsbury Publishing', 'https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Bloomsbury_Publishing_logo.svg/1280px-Bloomsbury_Publishing_logo.svg.png', 'Famous for publishing the Harry Potter series, Bloomsbury is a British independent publisher.'),
(5, 'Scholastic Inc.', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Scholastic_Logo.svg/1200px-Scholastic_Logo.svg.png', 'Major publisher of children''s books and educational materials including Percy Jackson and Hunger Games.'),
(6, 'Macmillan Publishers', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Macmillan_logo_2013.jpg', 'One of the ''Big Five'' English-language publishing companies with an international presence.'),
(7, 'Hachette Book Group', 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Hachette_Book_Group_logo.svg/1200px-Hachette_Book_Group_logo.svg.png', 'American publishing company owned by Hachette Livre, the largest publishing company in France.'),
(8, 'Oxford University Press', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Oxford_University_Press_logo.svg/1280px-Oxford_University_Press_logo.svg.png', 'A department of the University of Oxford, known for academic and educational publishing.'),
(9, 'Vintage Books', 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Vintage_Books_logo.svg/1280px-Vintage_Books_logo.svg.png', 'An imprint of Penguin Random House, Vintage Books publishes contemporary fiction and nonfiction.'),
(10, 'Indie Press Co.', 'https://st2.depositphotos.com/1000422/6242/v/950/depositphotos_62420363-stock-illustration-open-book-icon.jpg', 'Independent publisher focusing on self-help, business, and online commerce topics.');
