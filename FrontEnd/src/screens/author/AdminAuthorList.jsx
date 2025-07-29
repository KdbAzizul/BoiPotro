import React from "react";
import {
  useDeleteAuthorMutation,
  useGetAllAuthorsQuery,
} from "../../slices/authorApiSlice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Table, Button, Row, Col, Card, Badge } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaUser, FaBook, FaStar, FaEye } from "react-icons/fa";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const AdminAuthorList = () => {
  const { data: authors, isLoading, error, refetch } = useGetAllAuthorsQuery();
  const [deleteAuthor] = useDeleteAuthorMutation();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this author?")) {
      try {
        await deleteAuthor(id).unwrap();
        toast.success("Author deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete author");
      }
    }
  };

  // Calculate statistics
  const totalAuthors = authors?.length || 0;
  const totalBooks = authors?.reduce((sum, author) => sum + (author.book_count || 0), 0) || 0;
  const avgRating = authors?.length > 0 
    ? (authors.reduce((sum, author) => sum + (author.average_rating || 0), 0) / authors.length).toFixed(1)
    : '0.0';

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  }

  return (
    <>
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-2">Manage Authors</h1>
          <p className="text-muted mb-0">Create, edit, and manage your book authors</p>
        </Col>
        <Col xs="auto">
          <Link to="/admin/authors/create">
            <Button variant="success" className="btn-sm">
              <FaPlus /> Add New Author
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <FaUser className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{totalAuthors}</h3>
                  <small className="text-muted">Total Authors</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
       
      </Row>

      {/* Authors Table */}
      {authors?.length > 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table striped bordered hover responsive className="table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Author</th>
                  <th>Books</th>
                  <th>Rating</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold text-primary">
                            {author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="fw-semibold">{author.name}</div>
                          <small className="text-muted">ID: {author.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="info" className="px-3 py-2">
                        <FaBook className="me-1" />
                        {author.book_count || 0} books
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaStar className="text-warning me-1" />
                        <span className="fw-semibold">{author.average_rating || 0}</span>
                        <small className="text-muted ms-1">/ 5</small>
                      </div>
                    </td>
                    <td className="text-center">
                      <Link to={`/admin/authors/${author.id}`}>
                        <Button variant="outline-info" size="sm" className="me-2" title="View Details">
                          <FaEye />
                        </Button>
                      </Link>
                      <Link to={`/admin/authors/edit/${author.id}`}>
                        <Button variant="outline-primary" size="sm" className="me-2" title="Edit Author">
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(author.id)}
                        title="Delete Author"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        /* Empty State */
        <Card className="text-center border-0 shadow-sm">
          <Card.Body className="py-5">
            <div className="mb-4">
              <FaBook size={64} className="text-muted" />
            </div>
            <h4 className="mb-3">No Authors Found</h4>
            <p className="text-muted mb-4">Get started by adding your first author to the system.</p>
            <Link to="/admin/authors/create">
              <Button variant="success" size="lg">
                <FaPlus className="me-2" />
                Add Your First Author
              </Button>
            </Link>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default AdminAuthorList;





