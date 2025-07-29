import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../slices/productsApiSlice";
import { toast } from "react-toastify";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Spinner,
  Badge,
  InputGroup,
} from "react-bootstrap";

const ProductForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: existingBook, isLoading } = useGetProductDetailsQuery(id, {
    skip: !isEdit,
  });

  const [createBook] = useCreateProductMutation();
  const [updateBook] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    discount: "",
    isbn: "",
    publication_date: "",
    publisher_id: "",
    Image: "",
    authors: [],
    categories: [],
  });

  const [authorInput, setAuthorInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    if (isEdit && existingBook) {
      setFormData({
        ...existingBook,
        publication_date: existingBook.publication_date?.split("T")[0],
        authors: existingBook.authors || [],
        categories: existingBook.categories || [],
      });
    }
  }, [isEdit, existingBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (type) => {
    const input = type === "authors" ? authorInput : categoryInput;
    if (input.trim()) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], input.trim()],
      }));
      type === "authors" ? setAuthorInput("") : setCategoryInput("");
    }
  };

  const handleRemoveTag = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateBook({ id, ...formData }).unwrap();
        toast.success("Book updated");
      } else {
        await createBook(formData).unwrap();
        toast.success("Book created");
      }
      navigate("/admin/productlist");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Container className="my-5">
      <div className="bg-white p-5 rounded shadow-lg border border-gray-200 fade-in">
        <h2 className="text-center text-3xl font-bold text-primary mb-4">
          {isEdit ? "Edit Book" : "Create New Book"}
        </h2>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control name="title" value={formData.title} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="isbn">
                <Form.Label>ISBN</Form.Label>
                <Form.Control name="isbn" value={formData.isbn} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="publisher_id">
                <Form.Label>Publisher ID</Form.Label>
                <Form.Control name="publisher_id" value={formData.publisher_id} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="publication_date">
                <Form.Label>Publication Date</Form.Label>
                <Form.Control type="date" name="publication_date" value={formData.publication_date} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" name="description" rows={3} value={formData.description} onChange={handleChange} />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="stock">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="discount">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control type="number" name="discount" value={formData.discount} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="Image" className="mb-4">
            <Form.Label>Image URL</Form.Label>
            <Form.Control name="Image" value={formData.Image} onChange={handleChange} />
            {formData.Image && (
              <img src={formData.Image} alt="Preview" className="mt-3 rounded shadow-sm border w-32 h-auto" />
            )}
          </Form.Group>

          {/* Authors */}
          <Form.Group className="mb-4">
            <Form.Label>Authors</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control placeholder="Add author" value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} />
              <Button variant="outline-primary" onClick={() => handleAddTag("authors")}>Add</Button>
            </InputGroup>
            <div className="d-flex flex-wrap gap-2">
              {formData.authors.map((author, i) => (
                <Badge pill bg="primary" key={i}>
                  {author}{" "}
                  <span style={{ cursor: "pointer" }} onClick={() => handleRemoveTag("authors", i)}>×</span>
                </Badge>
              ))}
            </div>
          </Form.Group>

          {/* Categories */}
          <Form.Group className="mb-4">
            <Form.Label>Categories</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control placeholder="Add category" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} />
              <Button variant="outline-success" onClick={() => handleAddTag("categories")}>Add</Button>
            </InputGroup>
            <div className="d-flex flex-wrap gap-2">
              {formData.categories.map((cat, i) => (
                <Badge pill bg="success" key={i}>
                  {cat}{" "}
                  <span style={{ cursor: "pointer" }} onClick={() => handleRemoveTag("categories", i)}>×</span>
                </Badge>
              ))}
            </div>
          </Form.Group>

          <div className="text-center">
            <Button type="submit" variant="primary" size="lg">
              {isEdit ? "Update Book" : "Create Book"}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default ProductForm;
