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
import { FaPlus, FaTimes } from "react-icons/fa";

const ProductForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: existingBook, isLoading } = useGetProductDetailsQuery(id, {
    skip: !isEdit,
  });

  const [createBook] = useCreateProductMutation();
  const [updateBook] = useUpdateProductMutation();

  // State for form data
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

  // State for dropdown options
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // State for selected values
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [authorsRes, categoriesRes, publishersRes] = await Promise.all([
          fetch('/api/products/authors'),
          fetch('/api/products/categories'),
          fetch('/api/products/publishers')
        ]);

        const authorsData = await authorsRes.json();
        const categoriesData = await categoriesRes.json();
        const publishersData = await publishersRes.json();

        setAuthors(authorsData);
        setCategories(categoriesData);
        setPublishers(publishersData);
      } catch (error) {
        console.error('Error fetching options:', error);
        toast.error('Failed to load form options');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (isEdit && existingBook) {
      setFormData({
        ...existingBook,
        publication_date: existingBook.publication_date?.split("T")[0],
        Image: existingBook.image || "", // Map image to Image
        publisher_id: existingBook.publisher_id || "", // Use publisher_id from backend
        authors: existingBook.authors || [],
        categories: existingBook.categories || [],
      });
    }
  }, [isEdit, existingBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAuthor = () => {
    if (selectedAuthor && !formData.authors.includes(selectedAuthor)) {
      setFormData((prev) => ({
        ...prev,
        authors: [...prev.authors, selectedAuthor],
      }));
      setSelectedAuthor("");
    }
  };

  const handleAddCategory = () => {
    if (selectedCategory && !formData.categories.includes(selectedCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, selectedCategory],
      }));
      setSelectedCategory("");
    }
  };

  const handleRemoveAuthor = (index) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
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

  if (isLoading || loadingOptions) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <Spinner animation="border" className="d-block mx-auto" />
          <p className="mt-3">Loading form options...</p>
        </div>
      </Container>
    );
  }

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
                <Form.Control 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="isbn">
                <Form.Label>ISBN</Form.Label>
                <Form.Control 
                  name="isbn" 
                  value={formData.isbn} 
                  onChange={handleChange} 
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="publisher_id">
                <Form.Label>Publisher</Form.Label>
                <Form.Select 
                  name="publisher_id" 
                  value={formData.publisher_id} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Publisher</option>
                  {publishers.map((publisher) => (
                    <option key={publisher.id} value={publisher.id}>
                      {publisher.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="publication_date">
                <Form.Label>Publication Date</Form.Label>
                <Form.Control 
                  type="date" 
                  name="publication_date" 
                  value={formData.publication_date} 
                  onChange={handleChange} 
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              name="description" 
              rows={3} 
              value={formData.description} 
              onChange={handleChange} 
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <Form.Control 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="stock">
                <Form.Label>Stock</Form.Label>
                <Form.Control 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="discount">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control 
                  type="number" 
                  name="discount" 
                  value={formData.discount} 
                  onChange={handleChange} 
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="Image" className="mb-4">
            <Form.Label>Image URL</Form.Label>
            <Form.Control 
              name="Image" 
              value={formData.Image} 
              onChange={handleChange} 
            />
            {formData.Image && (
              <img 
                src={formData.Image} 
                alt="Preview" 
                className="mt-3 rounded shadow-sm border w-32 h-auto" 
              />
            )}
          </Form.Group>

          {/* Authors Selection */}
          <Form.Group className="mb-4">
            <Form.Label>Authors</Form.Label>
            <InputGroup className="mb-2">
              <Form.Select 
                value={selectedAuthor} 
                onChange={(e) => setSelectedAuthor(e.target.value)}
              >
                <option value="">Select Author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.name}>
                    {author.name}
                  </option>
                ))}
              </Form.Select>
              <Button 
                variant="outline-primary" 
                onClick={handleAddAuthor}
                disabled={!selectedAuthor}
              >
                <FaPlus />
              </Button>
            </InputGroup>
            <div className="d-flex flex-wrap gap-2">
              {formData.authors.map((author, i) => (
                <Badge pill bg="primary" key={i} className="d-flex align-items-center">
                  {author}
                  <FaTimes 
                    className="ms-2" 
                    style={{ cursor: "pointer" }} 
                    onClick={() => handleRemoveAuthor(i)}
                  />
                </Badge>
              ))}
            </div>
          </Form.Group>

          {/* Categories Selection */}
          <Form.Group className="mb-4">
            <Form.Label>Categories</Form.Label>
            <InputGroup className="mb-2">
              <Form.Select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
              <Button 
                variant="outline-success" 
                onClick={handleAddCategory}
                disabled={!selectedCategory}
              >
                <FaPlus />
              </Button>
            </InputGroup>
            <div className="d-flex flex-wrap gap-2">
              {formData.categories.map((category, i) => (
                <Badge pill bg="success" key={i} className="d-flex align-items-center">
                  {category}
                  <FaTimes 
                    className="ms-2" 
                    style={{ cursor: "pointer" }} 
                    onClick={() => handleRemoveCategory(i)}
                  />
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
