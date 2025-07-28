import React from 'react';
import { Card as MuiCard, CardContent, CardMedia, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const Card = ({ image, title, children, ...props }) => {
  return (
    <StyledCard {...props}>
      {image && (
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        {title && (
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default Card;
