import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";
import App from "./App.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import ProductScreen from "./screens/ProductScreen.jsx";
import CartScreen from "./screens/CartScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import PlaceOrderScreen from "./screens/PlaceOrderScreen.jsx";
import OrderScreen from "./screens/OrderScreen.jsx";
import OrderListScreen from "./screens/admin/OrderListScreen.jsx";
import ProductListScreen from "./screens/admin/ProductListScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import ProfileEditScreen from "./screens/ProfileEditScreen.jsx";
import ProductForm from "./screens/admin/ProductFormScreen.jsx";
import UserListScreen from "./screens/admin/UserListScreen.jsx";
import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen.jsx";
import AssignCouponScreen from "./screens/admin/AssignCouponScreen.jsx";
import AdminAuthorList from "./screens/author/AdminAuthorList.jsx";
import AuthorForm from "./screens/author/AuthorForm.jsx";
import AuthorDetailScreen from "./screens/author/AuthorDetailScreen.jsx";
import PublisherListScreen from "./screens/admin/PublisherListScreen.jsx";
import PublisherForm from "./screens/admin/PublisherForm.jsx";
import PublisherDetailScreen from "./screens/admin/PublisherDetailScreen.jsx";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="/page/:pageNumber" element={<HomeScreen />} />
      <Route path="/search/:keyword" element={<HomeScreen />} />
      <Route path="/search/:keyword/page/:pageNumber" element={<HomeScreen />} />
      <Route path="/product/:id" element={<ProductScreen />} />
      <Route path="/cart" element={<CartScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      <Route path="" element={<PrivateRoute />}>
        <Route path="/placeorder" element={<PlaceOrderScreen />} />
        <Route path="/order/:id" element={<OrderScreen />} />
        <Route path="/profile/edit" element={<ProfileEditScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/admin/coupons" element={<AssignCouponScreen />} />
        
      </Route>

      <Route path="" element={<AdminRoute />}>
        <Route path="/admin/orderlist" element={<OrderListScreen />} />
        <Route path="/admin/userlist" element={<UserListScreen />} />
        <Route path="/admin/productlist" element={<ProductListScreen />} />


        <Route path="/admin/authors" element={<AdminAuthorList />} />
        <Route path="/admin/authors/create" element={<AuthorForm />} />
        <Route path="/admin/authors/:id" element={<AuthorDetailScreen />} />
        <Route path="/admin/authors/edit/:id" element={<AuthorForm isEdit={true} />} />
        
        <Route path="/admin/publishers" element={<PublisherListScreen />} />
        <Route path="/admin/publishers/create" element={<PublisherForm />} />
        <Route path="/admin/publishers/:id" element={<PublisherDetailScreen />} />
        <Route path="/admin/publishers/edit/:id" element={<PublisherForm isEdit={true} />} />


        <Route path="/admin/product/create" element={<ProductForm />} />
        <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
        <Route
          path="/admin/product/edit/:id"
          element={<ProductForm isEdit={true} />}
        />

      </Route>
      <Route path="/admin/page/:pageNumber" element={<ProductListScreen />} />
<Route path="/admin/search/:keyword/page/:pageNumber" element={<ProductListScreen />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
