import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, InputBase, Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const SearchWrapper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:focus-within': {
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 2),
    width: '100%',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
}));

const SearchIconWrapper = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

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
    <Box component="form" onSubmit={submitHandler} sx={{ width: '100%', maxWidth: 400 }}>
      <SearchWrapper>
        <StyledInputBase
          placeholder="Search Books..."
          inputProps={{ 'aria-label': 'search' }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <SearchIconWrapper type="submit" aria-label="search">
          <SearchIcon />
        </SearchIconWrapper>
      </SearchWrapper>
    </Box>
  );
};

export default SearchBox;
