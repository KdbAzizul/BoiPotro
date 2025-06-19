import { Row, Col } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productsApiSlice";
import Product from "../components/Product";
import Loader from "../components/Loader";
import Message from "../components/Message";
const HomeScreen = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();

  // const [products,setProducts]=useState([]);

  // useEffect(()=>{
  //     const fetchProducts=async() => {
  //         const{data}=await axios.get('/api/products');
  //          console.log('Fetched Data:', data);
  //         setProducts(data);
  //     };
  //     fetchProducts();
  // }, []);

  return (
    <>
      {isLoading ? (
        <Loader/>
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <h1>Latest Product</h1>
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
