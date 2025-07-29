import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaBook, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAllPublishersQuery,
  useDeletePublisherMutation,
} from "../../slices/publisherApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
} from "react-bootstrap";

const PublisherListScreen = () => {
  const { data: publishers, isLoading, error, refetch } = useGetAllPublishersQuery();
  const [deletePublisher] = useDeletePublisherMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this publisher?")) {
      try {
        const result = await deletePublisher(id).unwrap();
        toast.success(result.message || "Publisher deleted successfully");
        refetch();
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

  return (
    <Container className="my-5">
      <div className="bg-white p-5 rounded shadow-lg border border-gray-200 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-3xl font-bold text-primary mb-0">
            <FaBuilding className="me-2" />
            Publisher Management
          </h2>
          <Link to="/admin/publishers/create">
            <Button variant="primary" className="d-flex align-items-center">
              <FaPlus className="me-2" />
              Add Publisher
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaBuilding className="text-primary mb-2" style={{ fontSize: '2rem' }} />
                <h4 className="text-primary">{publishers?.length || 0}</h4>
                <p className="text-muted mb-0">Total Publishers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaBook className="text-success mb-2" style={{ fontSize: '2rem' }} />
                <h4 className="text-success">
                  {publishers?.reduce((total, pub) => total + (pub.book_count || 0), 0) || 0}
                </h4>
                <p className="text-muted mb-0">Total Books</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaEye className="text-info mb-2" style={{ fontSize: '2rem' }} />
                <h4 className="text-info">
                  {publishers?.filter(pub => pub.book_count > 0).length || 0}
                </h4>
                <p className="text-muted mb-0">Active Publishers</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Publishers Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Publisher List</h5>
          </Card.Header>
          <Card.Body>
            {publishers?.length === 0 ? (
              <div className="text-center py-4">
                <FaBuilding className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h5 className="text-muted">No Publishers Found</h5>
                <p className="text-muted">Start by adding your first publisher.</p>
                <Link to="/admin/publishers/create">
                  <Button variant="primary">Add First Publisher</Button>
                </Link>
              </div>
            ) : (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact Info</th>
                    <th>Books</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publishers?.map((publisher, index) => (
                    <tr key={publisher.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{publisher.name}</strong>
                      </td>
                      <td>
                        <div className="small">
                          {publisher.contact_email && (
                            <div><strong>Email:</strong> {publisher.contact_email}</div>
                          )}
                          {publisher.website && (
                            <div><strong>Website:</strong> 
                              <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="ms-1">
                                {publisher.website}
                              </a>
                            </div>
                          )}
                          {publisher.address && (
                            <div><strong>Address:</strong> {publisher.address}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={publisher.book_count > 0 ? "success" : "secondary"}>
                          {publisher.book_count || 0} books
                        </Badge>
                      </td>
                      <td>
                        {new Date(publisher.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/admin/publishers/${publisher.id}`}>
                          <Button variant="outline-info" size="sm" className="me-2" title="View Details">
                            <FaEye />
                          </Button>
                        </Link>
                        <Link to={`/admin/publishers/edit/${publisher.id}`}>
                          <Button variant="outline-primary" size="sm" className="me-2" title="Edit Publisher">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteHandler(publisher.id)}
                          title="Delete Publisher"
                          disabled={publisher.book_count > 0}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default PublisherListScreen; 