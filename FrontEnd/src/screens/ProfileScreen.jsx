import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useProfileMutation } from "../slices/usersApiSlice";
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const ProfileScreen = () => {
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [name, setName] = useState(userInfo?.name || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateProfile, { isLoading }] = useProfileMutation();
  const {
    data: orders,
    isLoading: loadingOrders,
    error: errorOrders,
    refetch,
  } = useGetMyOrdersQuery();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await updateProfile({
        id: userInfo.id,
        name,
        email,
        password,
      }).unwrap();
      dispatch(setCredentials(res));
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <Row>
      <Col md={4}>
        <h2>User Profile</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="my-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="my-3" controlId="password">
            <Form.Label>Password (optional)</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="my-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={isLoading}>
            Update
          </Button>
          {isLoading && <Loader />}
        </Form>
      </Col>

      <Col md={8}>
        <h3 className="mt-4">My Orders</h3>
        {loadingOrders ? (
          <Loader />
        ) : errorOrders ? (
          <Message variant="danger">
            {errorOrders?.data?.message || "Error loading orders"}
          </Message>
        ) : orders.length === 0 ? (
          <Message>No orders found</Message>
        ) : (
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Coupon</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.cart_id}>
                  <td>{order.cart_id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        ["delivered", "completed"].includes(order.state_id)
                          ? "success"
                          : "warning"
                      }`}
                    >
                      {order.state_name}
                    </span>
                  </td>
                  <td>{order.total_item}</td>
                  <td>${order.total_price}</td>
                  <td>{order.payment_method || "Unpaid"}</td>
                  <td>{order.coupon_code || "-"}</td>

                  <td>
                    <Link to={`/order/${order.cart_id}`}>
                      <Button variant="light" size="sm">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
// import { useState, useEffect } from 'react';
// import { Form, Button, Row, Col } from 'react-bootstrap';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { useProfileMutation } from '../slices/usersApiSlice';
// import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
// import { setCredentials } from '../slices/authSlice';
// import Loader from '../components/Loader';
// import Message from '../components/Message';

// const ProfileScreen = () => {
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);

//   const [name, setName] = useState(userInfo?.name || '');
//   const [email, setEmail] = useState(userInfo?.email || '');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [updateProfile, { isLoading }] = useProfileMutation();
//   const {
//     data: orders,
//     isLoading: loadingOrders,
//     error: errorOrders,
//     refetch,
//   } = useGetMyOrdersQuery();

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     if (password && password !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     try {
//       const res = await updateProfile({
//         id: userInfo.id,
//         name,
//         email,
//         password,
//       }).unwrap();
//       dispatch(setCredentials(res));
//       toast.success('Profile updated successfully');
//     } catch (err) {
//       toast.error(err?.data?.message || 'Update failed');
//     }
//   };

//   return (
//     <Row>
//       <Col md={6}>
//         <h2>User Profile</h2>
//         <Form onSubmit={submitHandler}>
//           <Form.Group className='my-3' controlId='name'>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type='text'
//               placeholder='Enter name'
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group className='my-3' controlId='email'>
//             <Form.Label>Email Address</Form.Label>
//             <Form.Control
//               type='email'
//               placeholder='Enter email'
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group className='my-3' controlId='password'>
//             <Form.Label>Password (optional)</Form.Label>
//             <Form.Control
//               type='password'
//               placeholder='Enter new password'
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group className='my-3' controlId='confirmPassword'>
//             <Form.Label>Confirm Password</Form.Label>
//             <Form.Control
//               type='password'
//               placeholder='Confirm new password'
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//           </Form.Group>

//           <Button type='submit' variant='primary' disabled={isLoading}>
//             Update
//           </Button>
//           {isLoading && <Loader />}
//         </Form>

//         <hr />

//         <h3 className='mt-4'>My Orders</h3>
//         {loadingOrders ? (
//           <Loader />
//         ) : errorOrders ? (
//           <Message variant='danger'>
//             {errorOrders?.data?.message || 'Error loading orders'}
//           </Message>
//         ) : orders.length === 0 ? (
//           <Message>No orders found</Message>
//         ) : (
//           <ListGroup variant='flush'>
//             {orders.map((order) => (
//               <ListGroup.Item key={order.cart_id}>
//                 <Card className='p-2'>
//                   <p>
//                     <strong>Order ID:</strong> {order.cart_id}
//                   </p>
//                   <p>
//                     <strong>Date:</strong>{' '}
//                     {new Date(order.created_at).toLocaleString()}
//                   </p>
//                   <p>
//                     <strong>Status:</strong>{' '}
//                     <span
//                       className={`badge bg-${
//                         ['delivered', 'completed'].includes(order.state_id)
//                           ? 'success'
//                           : 'warning'
//                       }`}
//                     >
//                       {order.state_id}
//                     </span>
//                   </p>
//                   <p>
//                     <strong>Items:</strong> {order.total_item}
//                   </p>
//                   <p>
//                     <strong>Total:</strong> ${order.total_price}
//                   </p>
//                   <p>
//                     <strong>Payment:</strong>{' '}
//                     {order.payment_method || 'Unpaid'}
//                   </p>
//                   {order.coupon_code && (
//                     <p>
//                       <strong>Coupon:</strong> {order.coupon_code}
//                     </p>
//                   )}
//                 </Card>
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         )}
//       </Col>
//     </Row>
//   );
// };

// export default ProfileScreen;
