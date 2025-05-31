import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Stack, Dialog, DialogTitle, DialogContent, TextField, Alert, Zoom, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const [open, setOpen] = useState(true);

  const handleRole = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/api/login', {
        email,
        password,
      });
      login(response.data.access_token);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        if (response.data.is_admin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: '0 8px 40px #0003',
          background: 'linear-gradient(135deg, #f7faff 0%, #e3f0ff 100%)',
          p: 0,
        },
      }}
      TransitionComponent={Zoom}
      transitionDuration={500}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontSize: 32,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #2563eb 0%, #43a047 100%)',
          color: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          py: 3,
        }}
      >
        {selectedRole ? `Login as ${selectedRole.toUpperCase()}` : 'Login as'}
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 5 } }}>
        <Zoom in={!selectedRole} timeout={500} unmountOnExit>
          <Stack
            spacing={4}
            alignItems="center"
            justifyContent="center"
            sx={{ py: 4, display: !selectedRole ? 'flex' : 'none' }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                width: 240,
                fontWeight: 700,
                fontSize: 24,
                borderRadius: 3,
                background: 'linear-gradient(90deg, #2563eb 0%, #43a047 100%)',
                boxShadow: '0 4px 16px #2563eb22',
                transition: 'transform 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #43a047 0%, #2563eb 100%)',
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => handleRole('admin')}
            >
              ADMIN
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              sx={{
                width: 240,
                fontWeight: 700,
                fontSize: 24,
                borderRadius: 3,
                borderWidth: 2,
                borderColor: '#ff1744',
                color: '#ff1744',
                background: '#fff',
                boxShadow: '0 4px 16px #ff174422',
                transition: 'transform 0.2s',
                '&:hover': {
                  background: '#ffebee',
                  borderColor: '#d50000',
                  color: '#d50000',
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => handleRole('user')}
            >
              USER
            </Button>
            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
              Choose your role to continue login and unlock<br />the best job portal experience!
            </Typography>
          </Stack>
        </Zoom>
        <Zoom in={!!selectedRole} timeout={500} unmountOnExit>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', display: selectedRole ? 'block' : 'none' }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                margin="normal"
                required
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color={selectedRole === 'admin' ? 'primary' : 'error'}
                sx={{
                  mt: 3,
                  height: 56,
                  fontSize: 22,
                  fontWeight: 700,
                  borderRadius: 2,
                  background: selectedRole === 'admin'
                    ? 'linear-gradient(90deg, #2563eb 0%, #43a047 100%)'
                    : 'linear-gradient(90deg, #ff1744 0%, #ff8a65 100%)',
                  boxShadow: '0 4px 16px #2563eb22',
                  '&:hover': {
                    background: selectedRole === 'admin'
                      ? 'linear-gradient(90deg, #43a047 0%, #2563eb 100%)'
                      : 'linear-gradient(90deg, #ff8a65 0%, #ff1744 100%)',
                    transform: 'scale(1.03)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2, fontWeight: 500, color: '#2563eb' }}
                onClick={() => setSelectedRole(null)}
              >
                &larr; Back to role selection
              </Button>
            </form>
          </Box>
        </Zoom>
      </DialogContent>
    </Dialog>
  );
}

export default Login; 