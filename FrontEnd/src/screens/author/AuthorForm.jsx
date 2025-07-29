import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useGetAuthorByIdQuery,
} from "../../slices/authorApiSlice";
import { toast } from "react-toastify";
import { Form, Button, Card, Row, Col, Container } from "react-bootstrap";
import { FaSave, FaArrowLeft, FaUser, FaEdit } from "react-icons/fa";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const AuthorForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const { data: authorData, isSuccess, isLoading, error } = useGetAuthorByIdQuery(id, { skip: !isEdit });

  const [createAuthor, { isLoading: isCreating }] = useCreateAuthorMutation();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateAuthorMutation();

  useEffect(() => {
    if (isEdit && isSuccess && authorData) {
      setName(authorData.name || "");
      setBio(authorData.bio || "");
    }
  }, [isEdit, isSuccess, authorData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, bio };
      if (isEdit) {
        await updateAuthor({ id, ...payload }).unwrap();
        toast.success("Author updated successfully!");
      } else {
        await createAuthor(payload).unwrap();
        toast.success("Author created successfully!");
      }
      navigate("/admin/authors");
    } catch (error) {
      toast.error(error?.data?.message || "Error saving author");
    }
  };

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
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="mb-2">
                <FaUser className="me-2 text-primary" />
                {isEdit ? "Edit Author" : "Create New Author"}
              </h1>
              <p className="text-muted mb-0">
                {isEdit ? "Update author information" : "Add a new author to the system"}
              </p>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => navigate("/admin/authors")}
            >
              <FaArrowLeft className="me-1" />
              Back to Authors
            </Button>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <FaUser className="me-2 text-primary" />
                        Author Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter author name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="py-2"
                      />
                      <Form.Text className="text-muted">
                        Enter the full name of the author
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <FaEdit className="me-2 text-primary" />
                        Biography
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        placeholder="Enter author biography..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="py-2"
                      />
                      <Form.Text className="text-muted">
                        Provide a brief biography or description of the author
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <Row className="mt-4">
                  <Col className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isCreating || isUpdating}
                      className="flex-fill"
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {isEdit ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          {isEdit ? "Update Author" : "Create Author"}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => navigate("/admin/authors")}
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Preview Card (if editing) */}
          {isEdit && authorData && (
            <Card className="mt-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaUser className="me-2 text-primary" />
                  Author Preview
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                         style={{ width: '80px', height: '80px' }}>
                      <span className="fw-bold text-primary fs-4">
                        {authorData.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Col>
                  <Col md={9}>
                    <h5 className="mb-2">{authorData.name}</h5>
                    <p className="text-muted mb-2">
                      <strong>Books:</strong> {authorData.book_count || 0} books
                    </p>
                    <p className="text-muted mb-0">
                      <strong>Rating:</strong> {authorData.average_rating || 0}/5
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AuthorForm;
