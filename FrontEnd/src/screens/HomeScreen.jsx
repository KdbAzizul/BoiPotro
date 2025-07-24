import { Row, Col } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productsApiSlice";
import Product from "../components/Product";
import Loader from "../components/Loader";
import Message from "../components/Message";
import {useParams} from 'react-router-dom'
import { Link } from "react-router-dom";

const HomeScreen = () => {
 const { keyword } = useParams();
  const { data: products, isLoading, error } = useGetProductsQuery(keyword || '');



  return (
    <>
      {keyword && (
        <Link to='/' className="btn btn-light mb-4">
              Go Back
        </Link>
      )}
      {isLoading ? (
        <Loader/>
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <h1>Latest Books {keyword && `for "${keyword}"`}</h1>
          <Row>
            {products.map((product) => (
              <Col key={product.id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default HomeScreen;
