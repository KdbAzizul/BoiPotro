import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      setKeyword('');
      navigate(`/search/${trimmed}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Form onSubmit={submitHandler} className='d-flex mb-3'>
      <Form.Control
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search Books...'
        className='me-2'
      ></Form.Control>
      <Button type='submit' variant='outline-success'>
        Search
      </Button>
    </Form>
  );
};

export default SearchBox;
