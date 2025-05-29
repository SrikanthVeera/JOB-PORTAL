import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Paper, Button, TextField, Stack } from '@mui/material';
import { motion } from 'framer-motion';

export default function About() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); setSubmitted(true); setForm({ name: '', email: '', message: '' }); };

  return (
    <Box sx={{ bgcolor: '#f7f8fa', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: '#23242a', color: '#fff', pb: 6, pt: 0 }}>
        <Container maxWidth="lg" sx={{ pt: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <Typography variant="h3" fontWeight={700} mb={2}>
                  Got a project? <br />Let's talk
                </Typography>
                <Typography variant="body1" mb={3} color="#e0e0e0">
                  Discover how our business technology solutions and services can help you achieve your goals. We deliver innovative, impactful, and differentiated solutions for every client.
                </Typography>
                <Button variant="contained" color="warning" size="large" sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>Contact Us</Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80" alt="Team" style={{ width: '100%', borderRadius: 12, boxShadow: '0 8px 32px #0003' }} />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Business Solutions Section */}
      <Box sx={{ bgcolor: '#23242a', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={4}>Business Technology Solutions</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ bgcolor: '#ff6f00', color: '#fff', p: 3, borderRadius: 3, minHeight: 120 }}>
                <Typography variant="h6" fontWeight={700}>Business Technology Platform</Typography>
                <Typography variant="body2">A robust platform for digital transformation and process automation.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ bgcolor: '#23242a', color: '#fff', p: 3, borderRadius: 3, border: '1.5px solid #ff6f00', minHeight: 120 }}>
                <Typography variant="h6" fontWeight={700}>Analytics</Typography>
                <Typography variant="body2">Data-driven insights and analytics to power your business growth.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ bgcolor: '#23242a', color: '#fff', p: 3, borderRadius: 3, border: '1.5px solid #ff6f00', minHeight: 120 }}>
                <Typography variant="h6" fontWeight={700}>Technologies</Typography>
                <Typography variant="body2">Cutting-edge technologies and proven solutions for every industry.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Services Section */}
      <Box sx={{ bgcolor: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={4} align="center">What services do we offer?</Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={3}>
              <Stack alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#ff6f00', color: '#fff', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>D</Box>
                <Typography variant="h6" fontWeight={700}>Differentiation</Typography>
                <Typography variant="body2" align="center">Our core value: unique solutions for unique business needs.</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#ff6f00', color: '#fff', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>I</Box>
                <Typography variant="h6" fontWeight={700}>Innovation</Typography>
                <Typography variant="body2" align="center">We drive business growth through creative thinking and new ideas.</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#ff6f00', color: '#fff', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>I</Box>
                <Typography variant="h6" fontWeight={700}>Impact</Typography>
                <Typography variant="body2" align="center">We create measurable impact for our clients and their customers.</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* How can we help you? Section */}
      <Box sx={{ bgcolor: '#23242a', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={4} align="center">How can we help you?</Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <img src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80" alt="Teamwork" style={{ width: '100%', borderRadius: 12, boxShadow: '0 8px 32px #0003' }} />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <Paper elevation={0} sx={{ bgcolor: '#fff', color: '#23242a', p: 3, borderRadius: 3, boxShadow: '0 4px 24px #0001' }}>
                  <Typography variant="h5" fontWeight={700} mb={2}>Innovative Solutions</Typography>
                  <Typography variant="body2" mb={2}>Learn more about our smart, innovative offerings and solutions. We help organizations achieve their goals with a focus on the future, efficiency, and measurable results.</Typography>
                  <Button variant="contained" color="warning" sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>Contact Us</Button>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Key Strengths Section */}
      <Box sx={{ bgcolor: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={4} align="center">Our Key Strengths</Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h2" fontWeight={800} color="warning.main">220</Typography>
                <Typography variant="h6" fontWeight={700}>Consultants</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h2" fontWeight={800} color="warning.main">12</Typography>
                <Typography variant="h6" fontWeight={700}>Offices</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h2" fontWeight={800} color="warning.main">100%</Typography>
                <Typography variant="h6" fontWeight={700}>Regular Customers</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* We solve complex problems Section */}
      <Box sx={{ bgcolor: '#ff6f00', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={3} align="center">We solve complex problems</Typography>
          <Typography variant="body1" align="center" mb={4} sx={{ maxWidth: 600, mx: 'auto' }}>
            Business expertise and dedicated teams to meet each and every client's specific needs.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="inherit" sx={{ color: '#ff6f00', bgcolor: '#fff', borderRadius: 2, fontWeight: 700, px: 4, '&:hover': { bgcolor: '#ffe0b2' } }}>Contact Us</Button>
          </Box>
        </Container>
      </Box>
      {/* Contact Form Section */}
      <Box sx={{ bgcolor: '#23242a', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight={700} mb={2}>Main Office</Typography>
              <Typography variant="body2" mb={1}>Efficient Business Tech Tower</Typography>
              <Typography variant="body2" mb={1}>Address: 123, Lorem Ipsum St, Chennai</Typography>
              <Typography variant="body2" mb={1}>Email: info@business.com</Typography>
              <Typography variant="body2">Phone: +91 98765 43210</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={6} sx={{ p: 4, borderRadius: 3, bgcolor: '#fff', color: '#23242a' }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Contact Us</Typography>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
                    <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required type="email" />
                    <TextField label="Message" name="message" value={form.message} onChange={handleChange} fullWidth required multiline rows={3} />
                    <Button type="submit" variant="contained" color="warning" sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>Submit</Button>
                    {submitted && <Typography color="success.main">Thank you! We will get back to you soon.</Typography>}
                  </Stack>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Footer */}
      <Box sx={{ bgcolor: '#23242a', color: '#fff', py: 3, textAlign: 'center' }}>
        <Typography variant="body2">&copy; {new Date().getFullYear()} Business Technology Solutions. All rights reserved.</Typography>
      </Box>
    </Box>
  );
} 