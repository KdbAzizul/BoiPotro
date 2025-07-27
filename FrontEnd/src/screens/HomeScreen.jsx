import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Pagination } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { keyword, pageNumber = 1 } = useParams();
  
  const [currentPage, setCurrentPage] = useState(Number(pageNumber));
  const [pageSize, setPageSize] = useState(16);
  
  const { data, isLoading, error } = useGetProductsQuery({ 
    keyword: keyword || '', 
    pageNumber: currentPage,
    pageSize
  });
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredPagination, setFilteredPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [isUsingFilters, setIsUsingFilters] = useState(false);

  // Set initial products when data is loaded
  useEffect(() => {
    if (data) {
      setFilteredProducts(data.products);
      setFilteredPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      });
    }
  }, [data]);

  // Handle page change
  const handlePageChange = (page) => {
    if (isUsingFilters) {
      // If using filters, update the current page and refetch with filters
      setCurrentPage(page);
      handleFilterChange(lastAppliedFilters, page);
    } else {
      // If not using filters, navigate to the new page
      setCurrentPage(page);
      if (keyword) {
        navigate(`/search/${keyword}/page/${page}`);
      } else {
        navigate(`/page/${page}`);
      }
    }
  };

  // Store the last applied filters
  const [lastAppliedFilters, setLastAppliedFilters] = useState({
    categories: [],
    authors: [],
    publishers: [],
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    rating: ''
  });

  // Handle filter changes from Sidebar
  const handleFilterChange = async (filters, page = 1) => {
    try {
      setIsFiltering(true);
      setFilterError(null);
      setLastAppliedFilters(filters);
      
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
        setIsUsingFilters(false);
        if (data) {
          setFilteredProducts(data.products);
          setFilteredPagination({
            page: data.page,
            pages: data.pages,
            total: data.total
          });
        }
        setIsFiltering(false);
        return;
      }

      setIsUsingFilters(true);

      // Prepare query parameters
      const params = {
        page,
        pageSize
      };
      
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
      setFilteredProducts(response.data.products);
      setFilteredPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (err) {
      console.error('Error applying filters:', err);
      setFilterError('Failed to apply filters. Please try again.');
    } finally {
      setIsFiltering(false);
    }
  };

  // Pagination component
  const PaginationComponent = ({ pages, page, isAdmin = false, keyword = '' }) => {
    if (pages <= 1) return null;
    
    return (
      <Pagination className="justify-content-center my-3">
        {/* First page */}
        <Pagination.First 
          onClick={() => handlePageChange(1)} 
          disabled={page === 1}
        />
        
        {/* Previous page */}
        <Pagination.Prev 
          onClick={() => handlePageChange(page - 1)} 
          disabled={page === 1}
        />
        
        {/* Page numbers */}
        {[...Array(pages).keys()].map((x) => {
          const pageNum = x + 1;
          // Show current page, and 2 pages before and after
          if (
            pageNum === page ||
            pageNum === page - 1 ||
            pageNum === page - 2 ||
            pageNum === page + 1 ||
            pageNum === page + 2 ||
            pageNum === 1 ||
            pageNum === pages
          ) {
            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === page}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          } else if (
            (pageNum === page - 3 && pageNum > 1) ||
            (pageNum === page + 3 && pageNum < pages)
          ) {
            // Show ellipsis for skipped pages
            return <Pagination.Ellipsis key={pageNum} className="d-none d-md-block" />;
          } else {
            return null;
          }
        })}
        
        {/* Next page */}
        <Pagination.Next 
          onClick={() => handlePageChange(page + 1)} 
          disabled={page === pages}
        />
        
        {/* Last page */}
        <Pagination.Last 
          onClick={() => handlePageChange(pages)} 
          disabled={page === pages}
        />
      </Pagination>
    );
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
                <>
                  <Row>
                    {filteredProducts.map((product) => (
                      <Col key={product.id} sm={12} md={6} lg={3} xl={3}>
                        <Product product={product} />
                      </Col>
                    ))}
                  </Row>
                  
                  {/* Display pagination */}
                  <PaginationComponent 
                    pages={filteredPagination.pages} 
                    page={filteredPagination.page} 
                    keyword={keyword} 
                  />
                  
                  {/* Display product count */}
                  <div className="text-center text-muted mb-4">
                    Showing {filteredProducts.length} of {filteredPagination.total} products
                  </div>
                </>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HomeScreen;
