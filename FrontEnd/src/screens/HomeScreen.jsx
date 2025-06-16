import{Row,Col} from 'react-bootstrap'
import axios from 'axios'
import Product from '../components/Product'
import { useEffect,useState } from 'react'
const HomeScreen = () => {
    const [products,setProducts]=useState([]);

    useEffect(()=>{
        const fetchProducts=async() => {
            const{data}=await axios.get('/api/products');
             console.log('Fetched Data:', data);
            setProducts(data);
        };
        fetchProducts();
    }, []);

  return (
   <>
       <h1>Latest Product</h1> 
       <Row>
           {products.map( (product) => (
            <Col key={product.id}sm={12} md={6} lg={4} xl={3}>
                <Product product={product}/>
            </Col>
           ))} 
       </Row>
   </>
  )
}

export default HomeScreen