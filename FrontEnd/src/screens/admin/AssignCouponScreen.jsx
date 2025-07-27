import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, ListGroup, Row, Col, Alert } from "react-bootstrap";

const AssignCouponScreen = () => {
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    percentage_discount: "",
    amount_discount: "",
    maximum_discount: "",
    min_order_amount: "",
    valid_from: "",
    valid_until: "",
    usage_limit: "",
  });
  const [message, setMessage] = useState("");
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    axios.get("/api/users", { withCredentials: true }).then(res => setUsers(res.data));
    axios.get("/api/admin/coupons", { withCredentials: true }).then(res => setCoupons(res.data));
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const res = await axios.post("/api/admin/coupons", newCoupon, { withCredentials: true });
    setCoupons([...coupons, res.data]);
    setSelectedCoupon(res.data.id);
    setShowCreate(false);
    setMessage("Coupon created!");
  };

  const handleAssign = async () => {
    await axios.post("/api/admin/coupons/assign", {
      coupon_id: selectedCoupon,
      user_ids: selectedUsers
    }, { withCredentials: true });
    setMessage("Coupon assigned!");
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      await axios.delete(`/api/admin/coupons/${id}`, { withCredentials: true });
      setCoupons(coupons.filter(c => c.id !== id));
      if (selectedCoupon === id) setSelectedCoupon("");
      setMessage('Coupon deleted successfully');
    }
  };

  // Get unique levels from users
  const levels = Array.from(new Set(users.map(u => u.level).filter(Boolean)));

  // Filter users by selected level
  const filteredUsers = levelFilter === 'all' ? users : users.filter(u => u.level === levelFilter);

  return (
    <div>
      <h2>Assign Coupon to Users</h2>
      {message && <Alert variant="success">{message}</Alert>}

      <Button onClick={() => setShowCreate(!showCreate)} className="mb-3">
        {showCreate ? "Cancel" : "Create New Coupon"}
      </Button>

      {showCreate && (
        <Form onSubmit={handleCreateCoupon}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  value={newCoupon.description}
                  onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Percentage Discount</Form.Label>
                <Form.Control
                  type="number"
                  value={newCoupon.percentage_discount}
                  onChange={e => setNewCoupon({ ...newCoupon, percentage_discount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Amount Discount</Form.Label>
                <Form.Control
                  type="number"
                  value={newCoupon.amount_discount}
                  onChange={e => setNewCoupon({ ...newCoupon, amount_discount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Maximum Discount</Form.Label>
                <Form.Control
                  type="number"
                  value={newCoupon.maximum_discount}
                  onChange={e => setNewCoupon({ ...newCoupon, maximum_discount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Min Order Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={newCoupon.min_order_amount}
                  onChange={e => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Valid From</Form.Label>
                <Form.Control
                  type="date"
                  value={newCoupon.valid_from}
                  onChange={e => setNewCoupon({ ...newCoupon, valid_from: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Valid Until</Form.Label>
                <Form.Control
                  type="date"
                  value={newCoupon.valid_until}
                  onChange={e => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Usage Limit</Form.Label>
                <Form.Control
                  type="number"
                  value={newCoupon.usage_limit}
                  onChange={e => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                />
              </Form.Group>
              <Button type="submit" className="mt-2">Create Coupon</Button>
            </Col>
          </Row>
        </Form>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Select Coupon</Form.Label>
        <Form.Select
          value={selectedCoupon}
          onChange={e => setSelectedCoupon(e.target.value)}
        >
          <option value="">Select Coupon</option>
          {coupons.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </Form.Select>
      </Form.Group>

      {/* List all coupons with delete buttons */}
      <ListGroup className="mb-3">
        {coupons.map(c => (
          <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-center">
            <span>
              <strong>{c.code}</strong> - {c.description}
            </span>
            <Button variant="danger" size="sm" onClick={() => handleDeleteCoupon(c.id)}>
              Delete
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Show selected coupon details */}
      {selectedCoupon && (() => {
        const c = coupons.find(c => c.id === selectedCoupon || c.id === Number(selectedCoupon));
        if (!c) return null;
        return (
          <Alert variant="info" className="mb-3">
            <strong>{c.code}</strong> - {c.description}<br/>
            Discount: {c.percentage_discount ? `${c.percentage_discount}%` : c.amount_discount ? `$${c.amount_discount}` : ""}<br/>
            Max Discount: {c.maximum_discount}<br/>
            Min Order: {c.min_order_amount}<br/>
            Valid: {c.valid_from} to {c.valid_until}<br/>
            Usage Limit: {c.usage_limit || "∞"}
          </Alert>
        );
      })()}

      <h3>Users</h3>
      <Form.Group className="mb-3" controlId="levelFilter">
        <Form.Label>Filter by Level</Form.Label>
        <Form.Select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="all">All Levels</option>
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Check
        type="checkbox"
        label="Select All"
        checked={
          filteredUsers.length > 0 &&
          filteredUsers.every(u => selectedUsers.includes(u.id))
        }
        onChange={e => {
          if (e.target.checked) {
            setSelectedUsers([
              ...new Set([...selectedUsers, ...filteredUsers.map(u => u.id)])
            ]);
          } else {
            setSelectedUsers(selectedUsers.filter(id => !filteredUsers.map(u => u.id).includes(id)));
          }
        }}
        className="mb-2"
      />
      <ListGroup>
        {filteredUsers.map(u => (
          <ListGroup.Item key={u.id}>
            <input
              type="checkbox"
              value={u.id}
              checked={selectedUsers.includes(u.id)}
              onChange={e => {
                if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
              }}
            />
            {u.name} (Level: {u.level}, Badge: {u.badge}, Points: {u.points})
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button
        onClick={handleAssign}
        disabled={!selectedCoupon || selectedUsers.length === 0}
        className="mt-3"
      >
        Assign Coupon
      </Button>
    </div>
  );
};

export default AssignCouponScreen;