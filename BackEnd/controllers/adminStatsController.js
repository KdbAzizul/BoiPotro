import pool from '../db.js';
import asyncHandler from '../middleware/asyncHandler.js';

// ----------------------------------------
// Utility: State ID for Delivered Orders
// ----------------------------------------
const getDeliveredStateId = async () => {
  const result = await pool.query(`
    SELECT id FROM "BOIPOTRO"."cart_states"
    WHERE name = 'delivered'
  `);
  return result.rows[0].id;
};

// ----------------------------------------
// Sales & Orders Statistics
// ----------------------------------------
const getTotalRevenue = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT COALESCE(SUM(total_price), 0) AS total_revenue
    FROM "BOIPOTRO"."cart"
    WHERE created_at BETWEEN $1 AND $2 AND state_id = $3
  `, [start, end, stateId]);
  return parseFloat(result.rows[0].total_revenue);
};

const getTotalOrders = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT COUNT(*) AS total_orders
    FROM "BOIPOTRO"."cart"
    WHERE created_at BETWEEN $1 AND $2 AND state_id = $3
  `, [start, end, stateId]);
  return parseInt(result.rows[0].total_orders);
};

const getTotalBooksSold = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT COALESCE(SUM(quantity), 0) AS units_sold
    FROM "BOIPOTRO"."cartitems" ci
    JOIN "BOIPOTRO"."cart" c ON ci.cart_id = c.id
    WHERE c.created_at BETWEEN $1 AND $2 AND c.state_id = $3
  `, [start, end, stateId]);
  return parseInt(result.rows[0].units_sold);
};

const getAverageOrderValue = (revenue, orders) =>
  orders > 0 ? revenue / orders : 0;

const getAverageItemsPerOrder = (units, orders) =>
  orders > 0 ? units / orders : 0;

const getSalesByDay = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT DATE(created_at) AS date, SUM(total_price) AS revenue
    FROM "BOIPOTRO"."cart"
    WHERE created_at BETWEEN $1 AND $2 AND state_id = $3
    GROUP BY DATE(created_at)
    ORDER BY date
  `, [start, end, stateId]);
  return result.rows;
};

// Controller: GET /api/admin/sales-stats
const getSalesStats = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ message: 'Start and end dates required.' });

  const stateId = await getDeliveredStateId();

  const [revenue, orders, units] = await Promise.all([
    getTotalRevenue(start, end, stateId),
    getTotalOrders(start, end, stateId),
    getTotalBooksSold(start, end, stateId)
  ]);

  const stats = {
    totalRevenue: revenue,
    totalOrders: orders,
    totalBooksSold: units,
    averageOrderValue: getAverageOrderValue(revenue, orders),
    averageItemsPerOrder: getAverageItemsPerOrder(units, orders),
    salesByDay: await getSalesByDay(start, end, stateId),
  };

  res.json(stats);
});

// ----------------------------------------
// Top Entities Statistics
// ----------------------------------------
const getTopBooks = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT b.title, SUM(ci.quantity) AS units_sold
    FROM "BOIPOTRO"."cartitems" ci
    JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
    JOIN "BOIPOTRO"."cart" c ON ci.cart_id = c.id
    WHERE c.created_at BETWEEN $1 AND $2 AND c.state_id = $3
    GROUP BY b.title
    ORDER BY units_sold DESC
    LIMIT 10
  `, [start, end, stateId]);
  return result.rows;
};

const getTopCategories = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT cat.name, SUM(ci.quantity) AS units_sold
    FROM "BOIPOTRO"."cartitems" ci
    JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
    JOIN "BOIPOTRO"."book_categories" bc ON b.id = bc.book_id
    JOIN "BOIPOTRO"."categories" cat ON bc.category_id = cat.id
    JOIN "BOIPOTRO"."cart" c ON ci.cart_id = c.id
    WHERE c.created_at BETWEEN $1 AND $2 AND c.state_id = $3
    GROUP BY cat.name
    ORDER BY units_sold DESC
    LIMIT 10
  `, [start, end, stateId]);
  return result.rows;
};

const getTopAuthors = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT a.name, SUM(ci.quantity) AS units_sold
    FROM "BOIPOTRO"."cartitems" ci
    JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
    JOIN "BOIPOTRO"."bookauthors" ba ON b.id = ba.book_id
    JOIN "BOIPOTRO"."authors" a ON ba.author_id = a.id
    JOIN "BOIPOTRO"."cart" c ON ci.cart_id = c.id
    WHERE c.created_at BETWEEN $1 AND $2 AND c.state_id = $3
    GROUP BY a.name
    ORDER BY units_sold DESC
    LIMIT 10
  `, [start, end, stateId]);
  return result.rows;
};

const getTopPublishers = async (start, end, stateId) => {
  const result = await pool.query(`
    SELECT p.name, SUM(ci.quantity) AS units_sold
    FROM "BOIPOTRO"."cartitems" ci
    JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
    JOIN "BOIPOTRO"."publishers" p ON b.publisher_id = p.id
    JOIN "BOIPOTRO"."cart" c ON ci.cart_id = c.id
    WHERE c.created_at BETWEEN $1 AND $2 AND c.state_id = $3
    GROUP BY p.name
    ORDER BY units_sold DESC
    LIMIT 10
  `, [start, end, stateId]);
  return result.rows;
};

// ----------------------------------------
// User Statistics
// ----------------------------------------
const getTotalUsers = async () => {
  const result = await pool.query(`SELECT COUNT(*) AS total_users FROM "BOIPOTRO"."users"`);
  return parseInt(result.rows[0].total_users);
};

// const getNewUsers = async (start, end) => {
//   const result = await pool.query(`
//     SELECT COUNT(*) AS new_users
//     FROM "BOIPOTRO"."users"
//     WHERE created_at BETWEEN $1 AND $2
//   `, [start, end]);
//   return parseInt(result.rows[0].new_users);
// };

const getLoyalUsers = async (start, end) => {
  const result = await pool.query(`
    SELECT COUNT(*) AS loyal_users FROM (
      SELECT user_id FROM "BOIPOTRO"."cart"
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY user_id
      HAVING COUNT(*) > 3
    ) sub
  `, [start, end]);
  return parseInt(result.rows[0].loyal_users);
};

const getInactiveUsers = async (start, end) => {
  const result = await pool.query(`
    SELECT COUNT(*) AS inactive_users
    FROM "BOIPOTRO"."users" u
    WHERE NOT EXISTS (
      SELECT 1 FROM "BOIPOTRO"."cart" c
      WHERE c.user_id = u.id AND c.created_at BETWEEN $1 AND $2
    )
  `, [start, end]);
  return parseInt(result.rows[0].inactive_users);
};

// Controller: GET /api/admin/top-entities
const getTopEntitiesAndUsersStats = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ message: 'Start and end dates required.' });

  const stateId = await getDeliveredStateId();

  const stats = {
    topBooks: await getTopBooks(start, end, stateId),
    topCategories: await getTopCategories(start, end, stateId),
    topAuthors: await getTopAuthors(start, end, stateId),
    topPublishers: await getTopPublishers(start, end, stateId),
    totalUsers: await getTotalUsers(),
    // newUsers: await getNewUsers(start, end),
    loyalUsers: await getLoyalUsers(start, end),
    inactiveUsers: await getInactiveUsers(start, end),
  };

  res.json(stats);
});

// ----------------------------------------
// Reviews, Inventory, and Health Metrics
// ----------------------------------------
const getTotalReviews = async (start, end) => {
  const result = await pool.query(`
    SELECT COUNT(*) AS total_reviews
    FROM "BOIPOTRO"."reviews"
    WHERE review_date BETWEEN $1 AND $2
  `, [start, end]);
  return parseInt(result.rows[0].total_reviews);
};

const getAverageRating = async (start, end) => {
  const result = await pool.query(`
    SELECT COALESCE(AVG(rating), 0) AS avg_rating
    FROM "BOIPOTRO"."reviews"
    WHERE review_date BETWEEN $1 AND $2
  `, [start, end]);
  return parseFloat(result.rows[0].avg_rating).toFixed(2);
};

const getBooksWithoutReviews = async () => {
  const result = await pool.query(`
    SELECT COUNT(*) AS books_no_reviews
    FROM "BOIPOTRO"."books" b
    WHERE NOT EXISTS (
      SELECT 1 FROM "BOIPOTRO"."reviews" r WHERE r.book_id = b.id
    )
  `);
  return parseInt(result.rows[0].books_no_reviews);
};

const getBooksInStock = async () => {
  const result = await pool.query(`
    SELECT COUNT(*) AS in_stock FROM "BOIPOTRO"."books" WHERE stock > 0
  `);
  return parseInt(result.rows[0].in_stock);
};

const getBooksOutOfStock = async () => {
  const result = await pool.query(`
    SELECT COUNT(*) AS out_stock FROM "BOIPOTRO"."books" WHERE stock = 0
  `);
  return parseInt(result.rows[0].out_stock);
};

const getTotalBooks = async () => {
  const result = await pool.query(`SELECT COUNT(*) AS count FROM "BOIPOTRO"."books"`);
  return parseInt(result.rows[0].count);
};

const getTotalCategories = async () => {
  const result = await pool.query(`SELECT COUNT(*) AS count FROM "BOIPOTRO"."categories"`);
  return parseInt(result.rows[0].count);
};

const getTotalAuthors = async () => {
  const result = await pool.query(`SELECT COUNT(*) AS count FROM "BOIPOTRO"."authors"`);
  return parseInt(result.rows[0].count);
};

const getTotalPublishers = async () => {
  const result = await pool.query(`SELECT COUNT(*) AS count FROM "BOIPOTRO"."publishers"`);
  return parseInt(result.rows[0].count);
};

// Controller: GET /api/admin/reviews-inventory-stats
const getReviewsAndInventoryStats = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ message: 'Start and end dates required.' });

  const stats = {
    totalReviews: await getTotalReviews(start, end),
    averageRating: await getAverageRating(start, end),
    booksWithoutReviews: await getBooksWithoutReviews(),
    booksInStock: await getBooksInStock(),
    booksOutOfStock: await getBooksOutOfStock(),
    totalBooks: await getTotalBooks(),
    totalCategories: await getTotalCategories(),
    totalAuthors: await getTotalAuthors(),
    totalPublishers: await getTotalPublishers(),
  };

  res.json(stats);
});

// ----------------------------------------
// Exports
// ----------------------------------------
export {
  getSalesStats,
  getTopEntitiesAndUsersStats,
  getReviewsAndInventoryStats
}; 