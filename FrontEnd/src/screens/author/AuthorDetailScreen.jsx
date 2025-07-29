import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetAuthorByIdQuery } from "../../slices/authorApiSlice";
import { Button, Card, Row, Col, Container, Badge } from "react-bootstrap";
import { FaArrowLeft, FaUser, FaBook, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const AuthorDetailScreen = () => {
  const { id } = useParams();
  const { data: author, isLoading, error } = useGetAuthorByIdQuery(id);

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

  if (!author) {
    return (
      <Message variant="warning">
        Author not found
      </Message>
    );
  }

  const { name, bio, book_count, average_rating, books } = author;

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="mb-2">
                <FaUser className="me-2 text-primary" />
                {name}
              </h1>
              <p className="text-muted mb-0">Author Details</p>
            </div>
            <div className="d-flex gap-2">
              <Link to={`/admin/authors/edit/${id}`}>
                <Button variant="outline-primary" size="sm">
                  <FaEdit className="me-1" />
                  Edit Author
                </Button>
              </Link>
              <Link to="/admin/authors">
                <Button variant="outline-secondary" size="sm">
                  <FaArrowLeft className="me-1" />
                  Back to Authors
                </Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          {/* Author Info Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" 
                   style={{ width: '120px', height: '120px' }}>
                <span className="fw-bold text-primary fs-1">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h3 className="mb-3">{name}</h3>
              
              <div className="d-flex justify-content-center gap-4 mb-4">
                <div className="text-center">
                  <div className="fw-bold fs-4 text-primary">{book_count || 0}</div>
                  <small className="text-muted">Books</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold fs-4 text-warning">{average_rating || 0}</div>
                  <small className="text-muted">Rating</small>
                </div>
              </div>

              {bio && (
                <div className="text-start">
                  <h6 className="fw-semibold mb-2">Biography</h6>
                  <p className="text-muted mb-0">{bio}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {/* Books Section */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaBook className="me-2 text-primary" />
                Books by {name}
              </h5>
            </Card.Header>
            <Card.Body>
              {books && books.length > 0 ? (
                <Row>
                  {books.map((book) => (
                    <Col key={book.id} md={6} lg={4} className="mb-4">
                      <Card className="h-100 border-0 shadow-sm">
                        <div className="position-relative">
                          <Card.Img 
                            variant="top" 
                            src={book.image} 
                            alt={book.title}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                          {book.discount > 0 && (
                            <Badge 
                              bg="danger" 
                              className="position-absolute top-0 end-0 m-2"
                            >
                              -{book.discount}%
                            </Badge>
                          )}
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="fs-6 mb-2">{book.title}</Card.Title>
                          
                          <div className="d-flex align-items-center mb-2">
                            <FaStar className="text-warning me-1" />
                            <small className="text-muted">
                              {book.rating} ({book.review_count} reviews)
                            </small>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="fw-bold text-primary">৳{book.price}</span>
                                {book.discount > 0 && (
                                  <small className="text-muted text-decoration-line-through ms-2">
                                    ৳{Math.round(book.price * (1 + book.discount / 100))}
                                  </small>
                                )}
                              </div>
                              <Badge bg="info" className="px-2 py-1">
                                <FaBook className="me-1" />
                                Book
                              </Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <FaBook size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No Books Found</h5>
                  <p className="text-muted mb-0">This author hasn't published any books yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthorDetailScreen;
