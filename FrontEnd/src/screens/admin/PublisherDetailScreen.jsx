import React from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaBook, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetPublisherByIdQuery,
  useDeletePublisherMutation,
} from "../../slices/publisherApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
} from "react-bootstrap";

const PublisherDetailScreen = () => {
  const { id } = useParams();
  const { data: publisher, isLoading, error, refetch } = useGetPublisherByIdQuery(id);
  const [deletePublisher] = useDeletePublisherMutation();

  const deleteHandler = async () => {
    if (window.confirm("Are you sure you want to delete this publisher?")) {
      try {
        const result = await deletePublisher(id).unwrap();
        toast.success(result.message || "Publisher deleted successfully");
        // Navigate back to publisher list
        window.location.href = "/admin/publishers";
      } catch (error) {
        const errorMessage = error?.data?.message || error?.error || "Failed to delete publisher";
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="danger">{error?.data?.message || error?.error}</Message>;
  }

  if (!publisher) {
    return <Message variant="danger">Publisher not found</Message>;
  }

  return (
    <Container className="my-5">
      <div className="bg-white p-5 rounded shadow-lg border border-gray-200 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-3xl font-bold text-primary mb-0">
            <FaBuilding className="me-2" />
            Publisher Details
          </h2>
          <div>
            <Link to="/admin/publishers">
              <Button variant="outline-secondary" className="me-2">
                <FaArrowLeft className="me-2" />
                Back to Publishers
              </Button>
            </Link>
            <Link to={`/admin/publishers/edit/${publisher.id}`}>
              <Button variant="outline-primary" className="me-2">
                <FaEdit className="me-2" />
                Edit Publisher
              </Button>
            </Link>
            <Button
              variant="outline-danger"
              onClick={deleteHandler}
              disabled={publisher.book_count > 0}
              title={publisher.book_count > 0 ? "Cannot delete publisher with books" : "Delete Publisher"}
            >
              <FaTrash className="me-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Publisher Info Card */}
        <Card className="mb-4 border-primary">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FaBuilding className="me-2" />
              Publisher Information
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Name:</strong> {publisher.name}</p>
                <p><strong>Created:</strong> {new Date(publisher.created_at).toLocaleDateString()}</p>
                {publisher.contact_email && (
                  <p><strong>Email:</strong> {publisher.contact_email}</p>
                )}
                {publisher.website && (
                  <p><strong>Website:</strong> 
                    <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="ms-1">
                      {publisher.website}
                    </a>
                  </p>
                )}
              </Col>
              <Col md={6}>
                <p><strong>Total Books:</strong> 
                  <Badge bg="success" className="ms-2">
                    {publisher.book_count || 0}
                  </Badge>
                </p>
                <p><strong>Status:</strong> 
                  <Badge bg={publisher.book_count > 0 ? "success" : "secondary"} className="ms-2">
                    {publisher.book_count > 0 ? "Active" : "Inactive"}
                  </Badge>
                </p>
                {publisher.address && (
                  <p><strong>Address:</strong> {publisher.address}</p>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Books Section */}
        <Card className="border-info">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <FaBook className="me-2" />
              Books by {publisher.name}
            </h5>
          </Card.Header>
          <Card.Body>
            {publisher.books?.length === 0 ? (
              <div className="text-center py-4">
                <FaBook className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h5 className="text-muted">No Books Found</h5>
                <p className="text-muted">This publisher doesn't have any books yet.</p>
              </div>
            ) : (
              <Row>
                {publisher.books?.map((book) => (
                  <Col key={book.id} md={4} lg={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      {book.image && (
                        <Card.Img
                          variant="top"
                          src={book.image}
                          alt={book.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Body>
                        <Card.Title className="h6">{book.title}</Card.Title>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-primary fw-bold">${book.price}</span>
                          {book.discount > 0 && (
                            <Badge bg="danger">-{book.discount}%</Badge>
                          )}
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaStar className="text-warning me-1" />
                          <span className="small">{book.star} ({book.review_count} reviews)</span>
                        </div>
                        <div className="small text-muted">
                          <div>Stock: {book.stock}</div>
                          {book.authors?.length > 0 && (
                            <div>Authors: {book.authors.join(', ')}</div>
                          )}
                          {book.categories?.length > 0 && (
                            <div>Categories: {book.categories.join(', ')}</div>
                          )}
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-transparent">
                        <Link to={`/admin/product/${book.id}/edit`} className="btn btn-sm btn-outline-primary w-100">
                          Edit Book
                        </Link>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default PublisherDetailScreen; 