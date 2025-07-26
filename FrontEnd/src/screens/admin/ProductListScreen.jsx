import { useEffect } from "react";
import { Table, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { FaCheck, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../slices/productsApiSlice";

const ProductListScreen = () => {
  const dispatch = useDispatch();

  // Get all products
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();

  // Delete mutation
  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted");
        refetch(); // Refresh the product list
      } catch (err) {
        toast.error(err?.data?.message || "Delete failed");
      }
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Books</h1>
        </Col>
        <Col className="text-end">
          <Link to={`/admin/product/create`}>
            <Button
              className="btn-sm m-3"
              onClick={() => toast("New Book will be created")}
            >
              <FaEdit /> Create Product
            </Button>
          </Link>
        </Col>
      </Row>

      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>TITLE</th>
              <th>AUTHOR</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>PUBLISHER</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.authors?.join(", ")}</td>
                <td>${book.price}</td>
                <td>{book.categories?.join(", ")}</td>
                <td>{book.publisher}</td>

                <td>
                  <Link to={`/admin/product/edit/${book.id}`}>
                    <Button variant="light" className="btn-sm me-2">
                      <FaEdit />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteHandler(book.id)}
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
