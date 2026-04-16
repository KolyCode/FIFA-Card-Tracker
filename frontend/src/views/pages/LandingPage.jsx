import React, { useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
  Avatar,
  TextField,
  Paper
} from '@mui/material';

export default function LandingPage() {
  const pricingRef = useRef(null);

  const handleScroll = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.light', pb: { xs: 8, md: 12 } }}>
        <Box sx={{ width: '100%', mb: { xs: 4, md: 6 } }}>
          <img 
            src="https://raw.githubusercontent.com/corgi0/FIFA-Card-Tracker-Test/refs/heads/main/src/360_F_398444393_WGIX23d2n8KlzL4iQN2OMZtQeygyPP4m.jpg" 
            alt="FIFA Stickers banner" 
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} 
          />
        </Box>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
              Track every FIFA sticker, trade smarter together
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
              The ultimate companion for your sticker collection journey. Organize your hauls, 
              discover new trading partners, and complete your albums faster than ever before.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={handleScroll}
              sx={{ px: 4, py: 1.5, fontSize: '1.2rem' }}
            >
              Explore features
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }} ref={pricingRef}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 600 }}>
          Choose Your Club Tier
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          
          {/* Collector Free */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Typography variant="h4" gutterBottom color="text.secondary">Collector Free</Typography>
                <Typography variant="h3" color="primary" gutterBottom>
                  $0<Typography variant="h6" component="span" color="text.secondary">/mo</Typography>
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'left', color: 'text.secondary' }}>
                  <Typography variant="body1" paragraph>• Track your basic collection</Typography>
                  <Typography variant="body1" paragraph>• Standard trading limit (10/day)</Typography>
                  <Typography variant="body1" paragraph>• Community forum access</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button variant="outlined" color="primary" size="large" fullWidth sx={{ mx: 2 }}>
                  Join Club
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Swap Pro */}
          <Grid item xs={12} md={4}>
            <Card elevation={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '2px solid', borderColor: 'secondary.main', borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Typography variant="h4" gutterBottom color="secondary.main" fontWeight="bold">Swap Pro</Typography>
                <Typography variant="h3" color="secondary.main" gutterBottom>
                  $4.99<Typography variant="h6" component="span" color="text.secondary">/mo</Typography>
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'left', color: 'text.secondary' }}>
                  <Typography variant="body1" paragraph>• Unlimited tracking & adding</Typography>
                  <Typography variant="body1" paragraph>• Smart trade matching algorithm</Typography>
                  <Typography variant="body1" paragraph>• Completely Ad-free experience</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button variant="contained" color="primary" size="large" fullWidth sx={{ mx: 2 }}>
                  Join Club
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Club Elite */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Typography variant="h4" gutterBottom color="warning.dark">Club Elite</Typography>
                <Typography variant="h3" color="warning.dark" gutterBottom>
                  $9.99<Typography variant="h6" component="span" color="text.secondary">/mo</Typography>
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'left', color: 'text.secondary' }}>
                  <Typography variant="body1" paragraph>• Everything in Swap Pro</Typography>
                  <Typography variant="body1" paragraph>• Special shiny & foil tracking</Typography>
                  <Typography variant="body1" paragraph>• Early access to new series imports</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button variant="contained" color="primary" size="large" fullWidth sx={{ mx: 2 }}>
                  Join Club
                </Button>
              </CardActions>
            </Card>
          </Grid>

        </Grid>
      </Container>

      {/* Reviews Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 600 }}>
            What Our Collectors Say
          </Typography>
          <Grid container spacing={4}>
            
            {/* Review 1 */}
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, bgcolor: 'background.paper' }}>
                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                  AN
                </Avatar>
                <Typography variant="body1" paragraph fontStyle="italic" color="text.secondary" sx={{ mb: 3 }}>
                  "This app completely changed how I collect. It's so much easier to track what I have, and I was able to find the exact missing stickers for my World Cup album effortlessly."
                </Typography>
                <Typography variant="h6" fontWeight="bold">Aya Nakamura</Typography>
              </Paper>
            </Grid>

            {/* Review 2 */}
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, bgcolor: 'background.paper' }}>
                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'secondary.main', fontSize: '1.5rem' }}>
                  MG
                </Avatar>
                <Typography variant="body1" paragraph fontStyle="italic" color="text.secondary" sx={{ mb: 3 }}>
                  "Saved me so much time completing my album. The premium trade matching is an absolute game-changer. I highly recommend it to anyone serious about finishing!"
                </Typography>
                <Typography variant="h6" fontWeight="bold">Mateo García</Typography>
              </Paper>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box sx={{ bgcolor: 'grey.900', color: 'common.white', py: { xs: 6, md: 8 }, mt: 'auto' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Stay In The Loop
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4, color: 'grey.400' }}>
            Subscribe to our newsletter for the latest collection drops and trading tips. No spam, ever.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', px: 2 }}>
            <TextField 
              variant="outlined" 
              placeholder="Enter your email"
              size="small"
              sx={{ 
                bgcolor: 'common.white', 
                borderRadius: 1, 
                minWidth: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' }
                }
              }}
            />
            <Button variant="contained" color="primary" size="large" sx={{ px: 4 }}>
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}