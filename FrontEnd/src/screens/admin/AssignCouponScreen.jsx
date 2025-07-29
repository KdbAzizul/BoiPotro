import { useEffect, useState } from "react";
import axios from "axios";
import {
  Form,
  Button,
  ListGroup,
  Row,
  Col,
  Alert,
  Card,
  Container,
  Badge,
  Modal,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignCouponScreen = () => {
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [userLevels, setUserLevels] = useState([]);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCouponDetails, setSelectedCouponDetails] = useState(null);
  const [assignmentMode, setAssignmentMode] = useState("individual"); // "individual" or "level"
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
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, couponsRes, levelsRes] = await Promise.all([
          axios.get("/api/users", { withCredentials: true }),
          axios.get("/api/admin/coupons", { withCredentials: true }),
          axios.get("/api/admin/users/levels", { withCredentials: true }),
        ]);
        setUsers(usersRes.data || []);
        setCoupons(
          Array.isArray(couponsRes.data.coupons) ? couponsRes.data.coupons : []
        );
        setUserLevels(levelsRes.data || []);
      } catch (err) {
        setError(err.message);
        toast.error("Error loading data");
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/coupons", newCoupon, {
        withCredentials: true,
      });
      setCoupons([...coupons, res.data]);
      setSelectedCoupon(res.data.id);
      setShowCreate(false);
      toast.success("Coupon created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating coupon");
    }
  };

  const handleAssign = async () => {
    try {
      await axios.post(
        "/api/admin/coupons/assign",
        {
          coupon_id: selectedCoupon,
          user_ids: selectedUsers,
        },
        { withCredentials: true }
      );
      toast.success("Coupon assigned successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error assigning coupon");
    }
  };

  const handleAssignByLevel = async () => {
    try {
      await axios.post(
        "/api/admin/coupons/assign-by-level",
        {
          coupon_id: selectedCoupon,
          level_id: selectedLevel,
        },
        { withCredentials: true }
      );
      toast.success("Coupon assigned successfully to all users in this level!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error assigning coupon by level");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axios.delete(`/api/admin/coupons/${id}`, {
          withCredentials: true,
        });
        setCoupons(coupons.filter((c) => c.id !== id));
        if (selectedCoupon === id) setSelectedCoupon("");
        toast.success("Coupon deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting coupon");
      }
    }
  };

  const handleShowDetails = (coupon) => {
    setSelectedCouponDetails(coupon);
    setShowDetails(true);
  };

  const levels = Array.from(new Set(users.map((u) => u.level_name).filter(Boolean)));
  const filteredUsers =
    levelFilter === "all"
      ? users
      : users.filter((u) => u.level_name === levelFilter);

  return (
    <Container className="py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Coupons Management Card */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="m-0">Manage Coupons</h2>
          <Button
            variant={showCreate ? "light" : "outline-light"}
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Cancel" : "Create New Coupon"}
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {showCreate && (
            <Form onSubmit={handleCreateCoupon} className="mb-4">
              <Card className="bg-light">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          required
                          value={newCoupon.code}
                          onChange={(e) =>
                            setNewCoupon({ ...newCoupon, code: e.target.value })
                          }
                          placeholder="Enter coupon code"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={newCoupon.description}
                          onChange={(e) =>
                            setNewCoupon({
                              ...newCoupon,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter coupon description"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Usage Limit</Form.Label>
                        <Form.Control
                          type="number"
                          
                          value={newCoupon.usage_limit}
                          onChange={(e) =>
                            setNewCoupon({
                              ...newCoupon,
                              usage_limit: e.target.value,
                            })
                          }
                          placeholder="Enter Usage Limit"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Percentage Discount</Form.Label>
                            <Form.Control
                              type="number"
                              value={newCoupon.percentage_discount}
                              onChange={(e) =>
                                setNewCoupon({
                                  ...newCoupon,
                                  percentage_discount: e.target.value,
                                })
                              }
                              placeholder="0-100"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Amount Discount</Form.Label>
                            <Form.Control
                              type="number"
                              value={newCoupon.amount_discount}
                              onChange={(e) =>
                                setNewCoupon({
                                  ...newCoupon,
                                  amount_discount: e.target.value,
                                })
                              }
                              placeholder="Fixed amount"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Maximum Discount</Form.Label>
                            <Form.Control
                              type="number"
                              value={newCoupon.maximum_discount}
                              onChange={(e) =>
                                setNewCoupon({
                                  ...newCoupon,
                                  maximum_discount: e.target.value,
                                })
                              }
                              placeholder="Maximum limit"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Min Order Amount</Form.Label>
                            <Form.Control
                              type="number"
                              value={newCoupon.min_order_amount}
                              onChange={(e) =>
                                setNewCoupon({
                                  ...newCoupon,
                                  min_order_amount: e.target.value,
                                })
                              }
                              placeholder="Minimum order"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Valid From</Form.Label>
                            <Form.Control
                              type="date"
                              value={newCoupon.valid_from}
                              onChange={(e) =>
                                setNewCoupon({
                                  ...newCoupon,
                                  valid_from: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Valid Until</Form.Label>
                            <Form.Control
                              type="date"
                              value={newCoupon.valid_until}
                              onChange={(e) =>
                                setNewCoupon({
                                  ...newCoupon,
                                  valid_until: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Button type="submit" variant="primary">
                    Create Coupon
                  </Button>
                </Card.Body>
              </Card>
            </Form>
          )}

          {/* Coupons List */}
          <div className="mb-4">
            <h4 className="mb-3">Available Coupons</h4>
            <ListGroup>
              {coupons.map((c) => (
                <ListGroup.Item
                  key={c.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <Badge bg="primary" className="me-2">
                      {c.code}
                    </Badge>
                    <span className="text-muted">{c.description}</span>
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowDetails(c)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteCoupon(c.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Card.Body>
      </Card>

      {/* Users Assignment Card */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="m-0">Assign Coupons to Users</h3>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Coupon</Form.Label>
            <Form.Select
              value={selectedCoupon}
              onChange={(e) => setSelectedCoupon(e.target.value)}
              className="mb-3"
            >
              <option value="">Select Coupon</option>
              {coupons.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Assignment Mode Toggle */}
          <Form.Group className="mb-3">
            <Form.Label>Assignment Mode</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="individual-mode"
                name="assignmentMode"
                label="Individual Users"
                checked={assignmentMode === "individual"}
                onChange={() => setAssignmentMode("individual")}
              />
              <Form.Check
                type="radio"
                id="level-mode"
                name="assignmentMode"
                label="By User Level"
                checked={assignmentMode === "level"}
                onChange={() => setAssignmentMode("level")}
              />
            </div>
          </Form.Group>

          {assignmentMode === "individual" ? (
            <>
              <Form.Group className="mb-3" controlId="levelFilter">
                <Form.Label>Filter Users by Level</Form.Label>
                <Form.Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="mb-3"
                >
                  <option value="all">All Levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="Select All Users"
                checked={
                  filteredUsers.length > 0 &&
                  filteredUsers.every((u) => selectedUsers.includes(u.id))
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers([
                      ...new Set([
                        ...selectedUsers,
                        ...filteredUsers.map((u) => u.id),
                      ]),
                    ]);
                  } else {
                    setSelectedUsers(
                      selectedUsers.filter(
                        (id) => !filteredUsers.map((u) => u.id).includes(id)
                      )
                    );
                  }
                }}
                className="mb-3"
              />

              <ListGroup className="mb-3">
                {filteredUsers.map((u) => (
                  <ListGroup.Item key={u.id} className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      className="me-3"
                      checked={selectedUsers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedUsers([...selectedUsers, u.id]);
                        else
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== u.id)
                          );
                      }}
                    />
                    <div>
                      <strong>{u.name}</strong>
                      <div className="text-muted">
                        <Badge bg="info" className="me-2">
                          Level: {u.level_name || "No Level"}
                        </Badge>
                        <Badge bg="secondary" className="me-2">
                          Orders: {u.order_count || 0}
                        </Badge>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Button
                variant="primary"
                onClick={handleAssign}
                disabled={!selectedCoupon || selectedUsers.length === 0}
              >
                Assign Coupon to Selected Users
              </Button>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Select User Level</Form.Label>
                <Form.Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="mb-3"
                >
                  <option value="">Select Level</option>
                  {userLevels.map((level) => (
                    <option key={level.level_id} value={level.level_id}>
                      {level.level_name} ({level.min_orders}-{level.max_orders || '∞'} orders)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedLevel && (
                <Alert variant="info" className="mb-3">
                  <strong>Level Details:</strong>
                  {(() => {
                    const level = userLevels.find(l => l.level_id == selectedLevel);
                    return level ? (
                      <div>
                        <div>Level: {level.level_name}</div>
                        <div>Order Range: {level.min_orders} - {level.max_orders || '∞'} orders</div>
                        <div>Users in this level: {users.filter(u => u.level_id == selectedLevel).length}</div>
                      </div>
                    ) : null;
                  })()}
                </Alert>
              )}

              <Button
                variant="primary"
                onClick={handleAssignByLevel}
                disabled={!selectedCoupon || !selectedLevel}
              >
                Assign Coupon to All Users in Selected Level
              </Button>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Coupon Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Coupon Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCouponDetails && (
            <div>
              <h4>{selectedCouponDetails.code}</h4>
              <p className="text-muted">{selectedCouponDetails.description}</p>
              <hr />
              <dl className="row">
                <dt className="col-sm-4">Discount</dt>
                <dd className="col-sm-8">
                  {selectedCouponDetails.percentage_discount
                    ? `${selectedCouponDetails.percentage_discount}%`
                    : selectedCouponDetails.amount_discount
                    ? `$${selectedCouponDetails.amount_discount}`
                    : "N/A"}
                </dd>

                <dt className="col-sm-4">Max Discount</dt>
                <dd className="col-sm-8">
                  ${selectedCouponDetails.maximum_discount || "No limit"}
                </dd>

                <dt className="col-sm-4">Min Order</dt>
                <dd className="col-sm-8">
                  ${selectedCouponDetails.min_order_amount || "No minimum"}
                </dd>

                <dt className="col-sm-4">Valid Period</dt>
                <dd className="col-sm-8">
                  {selectedCouponDetails.valid_from} to{" "}
                  {selectedCouponDetails.valid_until}
                </dd>

                <dt className="col-sm-4">Usage Limit</dt>
                <dd className="col-sm-8">
                  {selectedCouponDetails.usage_limit || "∞"}
                </dd>
              </dl>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AssignCouponScreen;
