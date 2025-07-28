import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant }) => ({
  textTransform: 'none',
  padding: '8px 20px',
  borderRadius: '8px',
  fontWeight: 500,
  ...(variant === 'contained' && {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(variant === 'outlined' && {
    borderWidth: '2px',
    '&:hover': {
      borderWidth: '2px',
    },
  }),
}));

const Button = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;
