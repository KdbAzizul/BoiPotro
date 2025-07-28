import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, Container, Pagination } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { FaCheck, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../slices/productsApiSlice";
import Product from "../../components/Product";
import Sidebar from "../../components/Sidebar";

// Add the PaginationComponent here
const PaginationComponent = ({ pages, page, isAdmin = false, keyword = '' }) => {
  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => {
    if (keyword) {
      navigate(`/search/${keyword}/page/${pageNumber}`);
    } else {
      navigate(`/page/${pageNumber}`);
    }
  };

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

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keyword, pageNumber = 1 } = useParams();

  const [currentPage, setCurrentPage] = useState(Number(pageNumber));
  const [pageSize, setPageSize] = useState(16);

  // Get all products
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword: keyword || "",
    pageNumber: currentPage,
    pageSize,
  });

  // Delete mutation
  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted");
        refetch(); // Refresh the product list
      } catch (err) {
        toast.error(err?.data?.message || "Delete failed");
      }
    }
  };

  // Initialize with empty array instead of undefined
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredPagination, setFilteredPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [isUsingFilters, setIsUsingFilters] = useState(false);

  // Update the useEffect to handle potential undefined data
  useEffect(() => {
    if (data && data.products) {
      setFilteredProducts(data.products);
      setFilteredPagination({
        page: data.page || 1,
        pages: data.pages || 1,
        total: data.total || 0,
      });
    }
  }, [data]);

  const handleFilterChange = (filters) => {
    // Handle filter changes
  };

  // Add this function in your ProductListScreen component
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (keyword) {
      navigate(`/admin/search/${keyword}/page/${page}`);
    } else {
      navigate(`/admin/page/${page}`);
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
            <Link to="/" className="btn btn-light mb-4">
              Go Back
            </Link>
          )}

          <Row className="align-items-center">
            <Col>
              <h1>Books</h1>
            </Col>
            <Col className="text-end">
              <Link to={`/admin/product/create`}>
                <Button
                  className="btn-sm m-3"
                  onClick={() => toast("New Book will be created")}
                >
                  <FaEdit /> Create Product
                </Button>
              </Link>
            </Col>
          </Row>

          {loadingDelete && <Loader />}

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || error?.message || "An error occurred"}
            </Message>
          ) : isFiltering ? (
            <Loader />
          ) : filterError ? (
            <Message variant="danger">{filterError}</Message>
          ) : !filteredProducts || filteredProducts.length === 0 ? (
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

              {/* Display product count with null check */}
              <div className="text-center text-muted mb-4">
                Showing {filteredProducts?.length || 0} of{" "}
                {filteredPagination.total} products
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductListScreen;