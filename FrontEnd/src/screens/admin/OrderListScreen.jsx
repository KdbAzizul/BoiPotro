import React, { useEffect, useState } from "react";
import { Table, Button, Row, Col, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetOrdersQuery } from "../../slices/ordersApiSlice";
import { FaCheck, FaTimes, FaSearch } from "react-icons/fa";

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      refetch();
    }
  }, [userInfo, refetch]);

  useEffect(() => {
    if (orders) {
      if (searchTerm) {
        const filtered = orders.filter(order => 
          order.cart_id.toString().includes(searchTerm.toLowerCase()) ||
          order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOrders(filtered);
      } else {
        setFilteredOrders(orders);
      }
    }
  }, [orders, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const StatusIcon = ({ isCompleted }) => (
    <div className={`status-icon ${isCompleted ? 'completed' : 'pending'}`}>
      {isCompleted ? (
        <FaCheck className="icon-check" />
      ) : (
        <FaTimes className="icon-times" />
      )}
    </div>
  );

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>All Orders</h1>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by Order ID, Customer Name, or Email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : filteredOrders.length === 0 ? (
        <Message>No orders found</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>EMAIL</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.cart_id}>
                <td>{order.cart_id}</td>
                <td>{order.user_name}</td>
                <td>
                  <a href={`mailto:${order.user_email}`}>{order.user_email}</a>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>${Number(order.total_price).toFixed(2)}</td>
                <td>
                  <StatusIcon isCompleted={order.is_paid === true} />
                </td>
                <td>
                  <StatusIcon isCompleted={order.state_name=== "delivered"} />
                </td>
                <td>
                  <Link to={`/order/${order.cart_id}`}>
                    <Button variant="light" className="btn-sm">
                      Details
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <style>
        {`
          .status-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin: 0 auto;
            transition: all 0.3s ease;
          }

          .status-icon.completed {
            background-color: rgba(40, 167, 69, 0.2);
          }

          .status-icon.pending {
            background-color: rgba(220, 53, 69, 0.2);
          }

          .icon-check {
            color: #28a745;
            font-size: 1.2rem;
          }

          .icon-times {
            color: #dc3545;
            font-size: 1.2rem;
          }

          .table td {
            vertical-align: middle;
          }

          .search-input {
            border-radius: 20px;
            border: 1px solid #ced4da;
            padding: 0.5rem 1rem;
          }

          .search-input:focus {
            box-shadow: none;
            border-color: #80bdff;
          }
        `}
      </style>
    </>
  );
};

export default OrderListScreen;
