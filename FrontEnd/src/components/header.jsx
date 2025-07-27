import { useEffect } from "react";
import { Badge, Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { Link, useNavigate,useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation, useLogoutMutation } from "../slices/usersApiSlice";
import { useGetCartQuery } from "../slices/cartApiSlice";
import { logout } from "../slices/authSlice";
import { apiSlice } from "../slices/apiSlice";
import { cartApiSlice } from "../slices/cartApiSlice";
import SearchBox from "./SearchBox";

const Header = () => {
  //const { cartItems } = useSelector((state) => state.cart);
   const { keyword } = useParams();
  const { data = {}, isLoading, error, refetch } = useGetCartQuery(keyword || '');

  const {
    cartItems = [],
    itemsPrice = 0,
    shippingPrice = 0,

    totalPrice = 0,
  } = data;

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Refetch the cart when userInfo changes
    refetch();
  }, [userInfo, refetch]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      //dispatch(apiSlice.util.invalidateTags(['cart']));
      //dispatch(cartApiSlice.util.invalidateTags(['Cart']));
      dispatch(apiSlice.util.resetApiState());
      navigate("/login");
      console.log("Cart Items:", cartItems);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">
            বইপত্র
          </Navbar.Brand>
           
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            
            <Nav className="ms-auto">
              <SearchBox/>
              <Nav.Link as={Link} to="/cart">
                <FaShoppingCart /> Cart
                {cartItems.length > 0 && (
                  <Badge
                    pill
                    bg="success"
                    style={{
                      marginLeft: "5px",
                    }}
                  >
                    {cartItems.reduce((a, c) => a + c.quantity, 0)}
                  </Badge>
                )}
              </Nav.Link>

              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as="button" onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to="/login">
                  <FaUser /> Sign In
                </Nav.Link>
              )}

              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="admin" id="adminmenu">
                  <NavDropdown.Item as={Link} to="/admin/productlist">
                    Products
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/admin/userlist">
                    Users
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/admin/orderlist">
                    Orders
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    Statistics
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/coupons">
                    Coupons
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
