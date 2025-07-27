import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const HomeScreen = () => {
  const { keyword } = useParams();
  const { data: products, isLoading, error } = useGetProductsQuery(keyword || '');
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Set initial products when data is loaded
  useEffect(() => {
    if (products) {
      setFilteredProducts(products);
    }
  }, [products]);

  // Handle filter changes from Sidebar
  const handleFilterChange = async (filters) => {
    try {
      setIsFiltering(true);
      setFilterError(null);
      
      // Check if any filters are applied
      const hasFilters = (
        filters.categories.length > 0 ||
        filters.authors.length > 0 ||
        filters.publishers.length > 0 ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.sortBy ||
        filters.rating
      );

      // If no filters are applied, reset to original products
      if (!hasFilters) {
        setFilteredProducts(products);
        setIsFiltering(false);
        return;
      }

      // Prepare query parameters
      const params = {};
      
      if (filters.categories.length > 0) params.categories = filters.categories.join(',');
      if (filters.authors.length > 0) params.authors = filters.authors.join(',');
      if (filters.publishers.length > 0) params.publishers = filters.publishers.join(',');
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.rating) params.rating = filters.rating;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (keyword) params.keyword = keyword;

      // Make API request with filters
      const response = await axios.get('/api/products/filter', { params });
      setFilteredProducts(response.data);
    } catch (err) {
      console.error('Error applying filters:', err);
      setFilterError('Failed to apply filters. Please try again.');
    } finally {
      setIsFiltering(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={3}>
          <Sidebar onFilterChange={handleFilterChange} />
        </Col>
        
        {/* Main Content */}
        <Col md={9}>
          {keyword && (
            <Link to='/' className="btn btn-light mb-4">
              Go Back
            </Link>
          )}
          
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error?.data?.message || error.error}</Message>
          ) : isFiltering ? (
            <Loader />
          ) : filterError ? (
            <Message variant='danger'>{filterError}</Message>
          ) : (
            <>
              <h1>Latest Books {keyword && `for "${keyword}"`}</h1>
              
              {filteredProducts.length === 0 ? (
                <Message>No products match your filters. Try adjusting your criteria.</Message>
              ) : (
                <Row>
                  {filteredProducts.map((product) => (
                    <Col key={product.id} sm={12} md={6} lg={4} xl={3}>
                      <Product product={product} />
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HomeScreen;
