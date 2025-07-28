import React from 'react';
import { Box, Typography } from '@mui/material';
import { Star, StarHalf, StarOutline } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledRating = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .MuiSvgIcon-root': {
    color: theme.palette.warning.main,
  }
}));

const Rating = ({ value, text }) => {
  return (
    <StyledRating>
      <Box sx={{ display: 'flex', mr: 1 }}>
        <span>
          {value >= 1 ? <Star /> : value >= 0.5 ? <StarHalf /> : <StarOutline />}
        </span>
        <span>
          {value >= 2 ? <Star /> : value >= 1.5 ? <StarHalf /> : <StarOutline />}
        </span>
        <span>
          {value >= 3 ? <Star /> : value >= 2.5 ? <StarHalf /> : <StarOutline />}
        </span>
        <span>
          {value >= 4 ? <Star /> : value >= 3.5 ? <StarHalf /> : <StarOutline />}
        </span>
        <span>
          {value >= 5 ? <Star /> : value >= 4.5 ? <StarHalf /> : <StarOutline />}
        </span>
      </Box>
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </StyledRating>
  );
};

export default Rating