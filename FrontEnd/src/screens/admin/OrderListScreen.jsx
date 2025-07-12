import React, { useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetOrdersQuery } from "../../slices/ordersApiSlice";
import { FaCheck, FaTimes } from "react-icons/fa";

const OrderListScreen = () => {
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      refetch();
    }
  }, [userInfo, refetch]);

  return (
    <>
      <h1>All Orders</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
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
            {orders.map((order) => (
              <tr key={order.cart_id}>
                <td>{order.cart_id}</td>
                <td>{order.user_name}</td>
                <td>
                  <a href={`mailto:${order.user_email}`}>{order.user_email}</a>
                </td>
                <td>{order.created_at?.substring(0, 10)}</td>
                <td>${Number(order.total_price).toFixed(2)}</td>
                <td>
                  {order.state === "paid" ? (
                    <FaCheck style={{ color: "green" }} />
                  ) : (
                    <FaTimes style={{ color: "red" }} />
                  )}
                </td>
                <td>
                  {order.state === "delivered" ? (
                    <FaCheck style={{ color: "green" }} />
                  ) : (
                    <FaTimes style={{ color: "red" }} />
                  )}
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
    </>
  );
};

export default OrderListScreen;
