import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Stack, Paper, TextField, Alert, Fade } from '@mui/material';
import axios from 'axios';

// Free 3D illustration from Storyset (job search theme)
const illustration = 'https://storyset.com/illustration/job-hunt/bro';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!userLocation.trim()) {
      setError('Location is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('/api/register', {
        email,
        password,
        is_admin: false,
        full_name: username,
        phone,
        location: userLocation,
      });
      setSuccess('Registration successful! Please log in.');
      setUsername('');
      setPhone('');
      setUserLocation('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowForm(false);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Box sx={{ bgcolor: '#f7f8fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Fade in={showForm} timeout={700}>
          <Paper elevation={6} sx={{ p: { xs: 2, md: 6 }, borderRadius: 4, mt: 4 }}>
            <Typography variant="h3" fontWeight={700} mb={2} color="#222" align="center">
              User Registration
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Location"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ height: 56, fontSize: 22, fontWeight: 700, borderRadius: 2, mt: 2, boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}
                >
                  Register
                </Button>
              </Stack>
            </form>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default Register; 