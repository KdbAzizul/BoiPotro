import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: 'auto',
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s',
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}));

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              বইপত্র
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your trusted online bookstore offering a vast collection of Bengali and English books.
              Discover, learn, and explore with us.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <SocialButton aria-label="facebook">
                <Facebook />
              </SocialButton>
              <SocialButton aria-label="twitter">
                <Twitter />
              </SocialButton>
              <SocialButton aria-label="instagram">
                <Instagram />
              </SocialButton>
              <SocialButton aria-label="linkedin">
                <LinkedIn />
              </SocialButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
              <FooterLink href="/shipping">Shipping Information</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  123 Book Street, Dhaka 1000, Bangladesh
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" fontSize="small" />
                <FooterLink href="mailto:contact@boipotro.com">
                  contact@boipotro.com
                </FooterLink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="primary" fontSize="small" />
                <FooterLink href="tel:+880123456789">
                  +880 123 456 789
                </FooterLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} বইপত্র. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;