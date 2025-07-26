import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const STAT_OPTIONS = [
  { value: "sales", label: "Sales & Orders" },
  { value: "top", label: "Top Entities & Users" },
  { value: "reviews", label: "Reviews & Inventory" },
];

const AdminDashboardScreen = () => {
  const [selectedStat, setSelectedStat] = useState("sales");
  const [start, setStart] = useState(weekAgo);
  const [end, setEnd] = useState(today);
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch filter options for dynamic fields
  useEffect(() => {
    if (selectedStat === "top") {
      axios.get("/api/products/categories").then(res => setCategories(res.data || []));
      axios.get("/api/products/authors").then(res => setAuthors(res.data || []));
      axios.get("/api/products/publishers").then(res => setPublishers(res.data || []));
    }
  }, [selectedStat]);

  const fetchStats = async () => {
    setLoading(true);
    let url = "";
    let params = `start=${start}&end=${end}`;
    if (selectedStat === "top") {
      if (category) params += `&category=${category}`;
      if (author) params += `&author=${author}`;
      if (publisher) params += `&publisher=${publisher}`;
    }
    if (selectedStat === "sales") url = `/api/admin/sales-stats?${params}`;
    if (selectedStat === "top") url = `/api/admin/top-entities?${params}`;
    if (selectedStat === "reviews") url = `/api/admin/reviews-inventory-stats?${params}`;
    const res = await axios.get(url, { withCredentials: true });
    setData(res.data);
    setLoading(false);
  };

  // Fetch on stat change or when "Apply" is clicked
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [selectedStat]);

  const handleApply = () => fetchStats();

  // Defensive: always use arrays for .map
  const safe = (arr) => Array.isArray(arr) ? arr : [];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ marginBottom: "1rem" }}>
        <select value={selectedStat} onChange={e => setSelectedStat(e.target.value)}>
          {STAT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Show date range for all stats */}
        <label style={{ marginLeft: "1rem" }}>
          Start: <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          End: <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        {/* Dynamic filters for Top Entities */}
        {selectedStat === "top" && (
          <>
            <label style={{ marginLeft: "1rem" }}>
              Category:
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All</option>
                {safe(categories).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label style={{ marginLeft: "1rem" }}>
              Author:
              <select value={author} onChange={e => setAuthor(e.target.value)}>
                <option value="">All</option>
                {safe(authors).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label style={{ marginLeft: "1rem" }}>
              Publisher:
              <select value={publisher} onChange={e => setPublisher(e.target.value)}>
                <option value="">All</option>
                {safe(publishers).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button style={{ marginLeft: "1rem" }} onClick={handleApply}>Apply</button>
      </div>
      {loading && <div>Loading...</div>}
      {!loading && data && (
        <>
          {selectedStat === "sales" && (
            <>
              <h2>Sales & Orders</h2>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Total Revenue: ${data.totalRevenue?.toFixed(2) ?? 0}</div>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Total Orders: {data.totalOrders ?? 0}</div>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Total Books Sold: {data.totalBooksSold ?? 0}</div>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Avg Order Value: ${data.averageOrderValue?.toFixed(2) ?? 0}</div>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Avg Items/Order: {data.averageItemsPerOrder?.toFixed(2) ?? 0}</div>
              </div>
              <h3>Sales by Day</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={safe(data.salesByDay)}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
          {selectedStat === "top" && (
            <>
              <h2>Top Entities & Users</h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <h4>Top Books</h4>
                  <ul>{safe(data.topBooks).map((b, i) => <li key={i}>{b.title}: {b.units_sold}</li>)}</ul>
                </div>
                <div>
                  <h4>Top Categories</h4>
                  <ul>{safe(data.topCategories).map((c, i) => <li key={i}>{c.name}: {c.units_sold}</li>)}</ul>
                </div>
                <div>
                  <h4>Top Authors</h4>
                  <ul>{safe(data.topAuthors).map((a, i) => <li key={i}>{a.name}: {a.units_sold}</li>)}</ul>
                </div>
                <div>
                  <h4>Top Publishers</h4>
                  <ul>{safe(data.topPublishers).map((p, i) => <li key={i}>{p.name}: {p.units_sold}</li>)}</ul>
                </div>
              </div>
              <h3>User Stats</h3>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Total Users: {data.totalUsers ?? 0}</div>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Loyal Users: {data.loyalUsers ?? 0}</div>
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>Inactive Users: {data.inactiveUsers ?? 0}</div>
              </div>
            </>
          )}
          {selectedStat === "reviews" && (
            <>
              <h2>Reviews & Inventory</h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>Total Reviews: {data.totalReviews ?? 0}</div>
                <div>Average Rating: {data.averageRating ?? 0}</div>
                <div>Books Without Reviews: {data.booksWithoutReviews ?? 0}</div>
                <div>Books In Stock: {data.booksInStock ?? 0}</div>
                <div>Books Out of Stock: {data.booksOutOfStock ?? 0}</div>
                <div>Total Books: {data.totalBooks ?? 0}</div>
                <div>Total Categories: {data.totalCategories ?? 0}</div>
                <div>Total Authors: {data.totalAuthors ?? 0}</div>
                <div>Total Publishers: {data.totalPublishers ?? 0}</div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardScreen; 