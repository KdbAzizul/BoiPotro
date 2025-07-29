import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPublisherByIdQuery,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
} from "../../slices/publisherApiSlice";
import { toast } from "react-toastify";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Spinner,
  Card,
} from "react-bootstrap";
import { FaSave, FaArrowLeft, FaBuilding, FaEdit } from "react-icons/fa";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const PublisherForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: existingPublisher, isLoading } = useGetPublisherByIdQuery(id, {
    skip: !isEdit,
  });

  const [createPublisher] = useCreatePublisherMutation();
  const [updatePublisher] = useUpdatePublisherMutation();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    website: "",
    contact_email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && existingPublisher) {
      setFormData({
        name: existingPublisher.name || "",
        address: existingPublisher.address || "",
        website: existingPublisher.website || "",
        contact_email: existingPublisher.contact_email || "",
      });
    }
  }, [isEdit, existingPublisher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await updatePublisher({ id, ...formData }).unwrap();
        toast.success("Publisher updated successfully");
      } else {
        await createPublisher(formData).unwrap();
        toast.success("Publisher created successfully");
      }
      navigate("/admin/publishers");
    } catch (error) {
      console.error(error);
      const errorMessage = error?.data?.message || "Something went wrong.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container className="my-5">
      <div className="bg-white p-5 rounded shadow-lg border border-gray-200 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-3xl font-bold text-primary mb-0">
            <FaBuilding className="me-2" />
            {isEdit ? "Edit Publisher" : "Create New Publisher"}
          </h2>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/admin/publishers")}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" />
            Back to Publishers
          </Button>
        </div>

        {/* Preview Card for Edit Mode */}
        {isEdit && existingPublisher && (
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">
                <FaEdit className="me-2" />
                Current Publisher Details
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Name:</strong> {existingPublisher.name}</p>
                  <p><strong>Books:</strong> {existingPublisher.book_count || 0}</p>
                  {existingPublisher.contact_email && (
                    <p><strong>Email:</strong> {existingPublisher.contact_email}</p>
                  )}
                  {existingPublisher.website && (
                    <p><strong>Website:</strong> {existingPublisher.website}</p>
                  )}
                </Col>
                <Col md={6}>
                  {existingPublisher.address && (
                    <p><strong>Address:</strong> {existingPublisher.address}</p>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="name">
                <Form.Label>
                  <FaBuilding className="me-2" />
                  Publisher Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter publisher name"
                  required
                />
                <Form.Text className="text-muted">
                  Enter the full name of the publisher (e.g., "Penguin Random House")
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="address">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter publisher address"
                  rows={3}
                />
                <Form.Text className="text-muted">
                  Publisher's physical address (optional)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="website">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
                <Form.Text className="text-muted">
                  Publisher's official website (optional)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="contact_email">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="contact@publisher.com"
                />
                <Form.Text className="text-muted">
                  Publisher's contact email (optional)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || !formData.name.trim()}
              className="d-flex align-items-center mx-auto"
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  {isEdit ? "Update Publisher" : "Create Publisher"}
                </>
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default PublisherForm; 