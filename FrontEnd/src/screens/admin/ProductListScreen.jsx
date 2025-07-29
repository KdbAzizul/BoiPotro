import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../slices/productsApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const ProductListScreen = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortAsc, setSortAsc] = useState(true); // Toggle for sorting by stock

  const { data, isLoading, error, refetch } = useGetProductsQuery({pageSize: 1000, });
  const [deleteProduct] = useDeleteProductMutation();
  const [searchData, setSearchData] = useState(null);

  const handleSearch = async () => {
    const res = await fetch(`/api/products/search?keyword=${searchKeyword}`);
    const json = await res.json();
    setSearchData(json);
  };

  useEffect(() => {
    if (searchKeyword) {
      const fetchSearchResults = async () => {
        const res = await fetch(`/api/products/search?keyword=${searchKeyword}`);
        const json = await res.json();
        setSearchData(json);
      };
      fetchSearchResults();
    } else {
      setSearchData(null);
    }
  }, [searchKeyword]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const result = await deleteProduct(id).unwrap();
        toast.success(result.message || "Product deleted successfully");
        refetch();
      } catch (error) {
        const errorMessage = error?.data?.message || error?.error || "Failed to delete product";
        toast.error(errorMessage);
      }
    }
  };

  // Sorting
  const filteredProducts = searchData
    ? searchData.products
    : data?.products || [];

  const sortedProducts = [...filteredProducts].sort((a, b) =>
    sortAsc ? a.stock - b.stock : b.stock - a.stock
  );

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search books..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Col>
        <Col md="auto">
          <Button onClick={handleSearch}>Search</Button>
        </Col>
        <Col md="auto">
          <Button variant="info" onClick={() => setSortAsc(!sortAsc)}>
            Sort by Stock {sortAsc ? "↑" : "↓"}
          </Button>
        </Col>
        <Col className="text-end">
          <Link to="/admin/product/create">
            <Button className="btn-sm">
              <FaPlus /> Create Book
            </Button>
          </Link>
        </Col>
      </Row>

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
              <th>Title</th>
              <th>Authors</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title}</td>
                <td>{product.authors.join(", ")}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>{product.discount}%</td>
                <td>
                  <Link to={`/admin/product/edit/${product.id}`}>
                    <Button variant="light" className="btn-sm me-2">
                      <FaEdit />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteHandler(product.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default ProductListScreen;
