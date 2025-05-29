import React from 'react';
import { Container, Paper, Stack, Avatar, TextField, Button, Alert, Box, Typography } from '@mui/material';

export default function AdminProfile({ profile, success, error, handleChange, handleSave, logout }) {
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Box sx={{ bgcolor: '#1976d2', color: '#fff', p: 2, borderRadius: 2, mb: 3, textAlign: 'center', fontWeight: 700, fontSize: 22 }}>
        Admin Profile Page
      </Box>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: '#f3f4f6', 
              color: '#888', 
              fontSize: 48,
              border: '2px solid #e0e0e0'
            }} 
          />
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Role: {profile.role || 'Admin'}
          </Typography>
          <Box sx={{ width: '100%' }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={profile.full_name || ''}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Mobile Number"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                variant="outlined"
              />
              {success && <Alert severity="success">{success}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}
              <Button 
                variant="contained" 
                onClick={handleSave}
                sx={{ 
                  height: '45px',
                  fontWeight: 600
                }}
              >
                Update Profile
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={logout}
                sx={{ 
                  height: '45px',
                  fontWeight: 600
                }}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
} 