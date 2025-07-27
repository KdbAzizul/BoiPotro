import React, { useState, useEffect } from 'react';
import { Form, Button, Accordion, Card } from 'react-bootstrap';
import { FaFilter, FaSearch } from 'react-icons/fa';
import './Sidebar.css';
import axios from 'axios';

const Sidebar = ({ onFilterChange }) => {
  // Filter state
  const [filters, setFilters] = useState({
    categories: [],
    authors: [],
    publishers: [],
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    rating: ''
  });

  // Search terms for filtering long lists
  const [categorySearch, setCategorySearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [publisherSearch, setPublisherSearch] = useState('');

  // Data from API
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoading(true);
        // Fetch all data in parallel
        const [categoriesRes, authorsRes, publishersRes] = await Promise.all([
          axios.get('/api/products/categories'),
          axios.get('/api/products/authors'),
          axios.get('/api/products/publishers')
        ]);

        setCategories(categoriesRes.data);
        setAuthors(authorsRes.data);
        setPublishers(publishersRes.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Handle checkbox changes
  const handleCheckboxChange = (type, id) => {
    setFilters(prev => {
      const updatedSelection = prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id];
      
      return { ...prev, [type]: updatedSelection };
    });
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      categories: [],
      authors: [],
      publishers: [],
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      rating: ''
    });
    setCategorySearch('');
    setAuthorSearch('');
    setPublisherSearch('');
    onFilterChange({
      categories: [],
      authors: [],
      publishers: [],
      priceRange: { min: '', max: '' },
      sortBy: '',
      rating: ''
    });
  };

  // Filter lists based on search terms
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  
  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(authorSearch.toLowerCase())
  );
  
  const filteredPublishers = publishers.filter(publisher => 
    publisher.name.toLowerCase().includes(publisherSearch.toLowerCase())
  );

  return (
    <div className="sidebar">
      <h4 className="sidebar-title"><FaFilter /> Advanced Filters</h4>
      
      {isLoading ? (
        <p>Loading filters...</p>
      ) : (
        <Accordion defaultActiveKey="0" alwaysOpen>
          {/* Categories */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Categories</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3 search-box">
                <Form.Control
                  type="text"
                  placeholder="Search categories"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </Form.Group>
              <div className="scrollable-list">
                {filteredCategories.map((category) => (
                  <Form.Check
                    key={category.id}
                    type="checkbox"
                    id={`category-${category.id}`}
                    label={category.name}
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCheckboxChange('categories', category.id)}
                  />
                ))}
                {filteredCategories.length === 0 && (
                  <p className="text-muted">No categories found</p>
                )}
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Authors */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Authors</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3 search-box">
                <Form.Control
                  type="text"
                  placeholder="Search authors"
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                />
              </Form.Group>
              <div className="scrollable-list">
                {filteredAuthors.map((author) => (
                  <Form.Check
                    key={author.id}
                    type="checkbox"
                    id={`author-${author.id}`}
                    label={author.name}
                    checked={filters.authors.includes(author.id)}
                    onChange={() => handleCheckboxChange('authors', author.id)}
                  />
                ))}
                {filteredAuthors.length === 0 && (
                  <p className="text-muted">No authors found</p>
                )}
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Publishers */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Publishers</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3 search-box">
                <Form.Control
                  type="text"
                  placeholder="Search publishers"
                  value={publisherSearch}
                  onChange={(e) => setPublisherSearch(e.target.value)}
                />
              </Form.Group>
              <div className="scrollable-list">
                {filteredPublishers.map((publisher) => (
                  <Form.Check
                    key={publisher.id}
                    type="checkbox"
                    id={`publisher-${publisher.id}`}
                    label={publisher.name}
                    checked={filters.publishers.includes(publisher.id)}
                    onChange={() => handleCheckboxChange('publishers', publisher.id)}
                  />
                ))}
                {filteredPublishers.length === 0 && (
                  <p className="text-muted">No publishers found</p>
                )}
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Price Range */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>Price Range</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex gap-2 mb-3">
                <Form.Group className="flex-grow-1">
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="flex-grow-1">
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                  />
                </Form.Group>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Sort By */}
          <Accordion.Item eventKey="4">
            <Accordion.Header>Sort By</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated</option>
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>

          {/* Rating */}
          <Accordion.Item eventKey="5">
            <Accordion.Header>Minimum Rating</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={filters.rating}
                onChange={(e) => handleInputChange('rating', e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
                <option value="1">1★ & above</option>
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}

      <div className="filter-actions mt-4">
        <Button variant="primary" onClick={applyFilters} className="w-100 mb-2">
          Apply Filters
        </Button>
        <Button variant="outline-secondary" onClick={resetFilters} className="w-100">
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;