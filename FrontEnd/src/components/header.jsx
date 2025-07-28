import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import {
  ShoppingCart,
  Person,
  Menu as MenuIcon,
  Logout,
  Dashboard,
  People,
  ShoppingBag,
  BarChart,
  LocalOffer
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation, useLogoutMutation } from "../slices/usersApiSlice";
import { useGetCartQuery } from "../slices/cartApiSlice";
import { logout } from "../slices/authSlice";
import { styled } from "@mui/material/styles";
import SearchBox from "./SearchBox";
import { apiSlice } from "../slices/apiSlice";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontFamily: 'Merriweather, serif',
  fontWeight: 700,
  fontSize: '1.5rem',
  textDecoration: 'none',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

const Header = () => {
  const { keyword } = useParams();
  const { data = {}, refetch } = useGetCartQuery(keyword || '');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

  const {
    cartItems = [],
    itemsPrice = 0,
    shippingPrice = 0,
    totalPrice = 0,
  } = data;

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    refetch();
  }, [userInfo, refetch]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(apiSlice.util.resetApiState());
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleMobileMenuOpen = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleAdminMenuOpen = (event) => setAdminMenuAnchor(event.currentTarget);
  const handleAdminMenuClose = () => setAdminMenuAnchor(null);

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="primary"
                edge="start"
                onClick={handleMobileMenuOpen}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Link to="/" style={{ textDecoration: 'none' }}>
              <LogoText variant="h6">BoiPotro</LogoText>
            </Link>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchBox />
              
              <Link to="/cart" style={{ textDecoration: 'none' }}>
                <IconButton color="primary">
                  <StyledBadge badgeContent={cartItems.reduce((a, c) => a + c.quantity, 0)}>
                    <ShoppingCart />
                  </StyledBadge>
                </IconButton>
              </Link>

              {userInfo ? (
                <>
                  <Button
                    color="primary"
                    onClick={handleUserMenuOpen}
                    startIcon={
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: theme.palette.primary.main 
                        }}
                      >
                        {userInfo.name[0].toUpperCase()}
                      </Avatar>
                    }
                  >
                    {userInfo.name}
                  </Button>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        width: 200,
                      },
                    }}
                  >
                    <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { handleUserMenuClose(); logoutHandler(); }}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </MenuItem>
                  </Menu>

                  {userInfo.isAdmin && (
                    <>
                      <Button
                        color="primary"
                        onClick={handleAdminMenuOpen}
                        startIcon={<Dashboard />}
                      >
                        Admin
                      </Button>
                      <Menu
                        anchorEl={adminMenuAnchor}
                        open={Boolean(adminMenuAnchor)}
                        onClose={handleAdminMenuClose}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            width: 200,
                          },
                        }}
                      >
                        <MenuItem component={Link} to="/admin/productlist" onClick={handleAdminMenuClose}>
                          <ListItemIcon>
                            <ShoppingBag fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Products" />
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/userlist" onClick={handleAdminMenuClose}>
                          <ListItemIcon>
                            <People fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Users" />
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/orderlist" onClick={handleAdminMenuClose}>
                          <ListItemIcon>
                            <ShoppingCart fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Orders" />
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/dashboard" onClick={handleAdminMenuClose}>
                          <ListItemIcon>
                            <BarChart fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Statistics" />
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/coupons" onClick={handleAdminMenuClose}>
                          <ListItemIcon>
                            <LocalOffer fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Coupons" />
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  color="primary"
                  variant="outlined"
                  startIcon={<Person />}
                >
                  Sign In
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            width: '100%',
            maxWidth: '320px',
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <SearchBox />
        </Box>
        <MenuItem component={Link} to="/cart" onClick={handleMobileMenuClose}>
          <ListItemIcon>
            <StyledBadge badgeContent={cartItems.reduce((a, c) => a + c.quantity, 0)}>
              <ShoppingCart color="primary" />
            </StyledBadge>
          </ListItemIcon>
          <ListItemText primary="Cart" />
        </MenuItem>
        
        {userInfo ? (
          <>
            <MenuItem component={Link} to="/profile" onClick={handleMobileMenuClose}>
              <ListItemIcon>
                <Person color="primary" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            
            {userInfo.isAdmin && (
              <>
                <Divider textAlign="left">Admin</Divider>
                <MenuItem component={Link} to="/admin/productlist" onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <ShoppingBag color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Products" />
                </MenuItem>
                <MenuItem component={Link} to="/admin/userlist" onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <People color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Users" />
                </MenuItem>
                <MenuItem component={Link} to="/admin/orderlist" onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <ShoppingCart color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Orders" />
                </MenuItem>
                <MenuItem component={Link} to="/admin/dashboard" onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <BarChart color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Statistics" />
                </MenuItem>
                <MenuItem component={Link} to="/admin/coupons" onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <LocalOffer color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Coupons" />
                </MenuItem>
              </>
            )}
            
            <Divider />
            <MenuItem onClick={() => { handleMobileMenuClose(); logoutHandler(); }}>
              <ListItemIcon>
                <Logout color="primary" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </>
        ) : (
          <MenuItem component={Link} to="/login" onClick={handleMobileMenuClose}>
            <ListItemIcon>
              <Person color="primary" />
            </ListItemIcon>
            <ListItemText primary="Sign In" />
          </MenuItem>
        )}
      </Menu>
    </StyledAppBar>
  );
};

export default Header;
