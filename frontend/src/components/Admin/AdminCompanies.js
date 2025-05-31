import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Stack, Chip, IconButton, Button, Box, Alert, Grow } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export default function AdminCompanies({ onEdit }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
    } catch (e) {
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await axios.delete(`/api/companies/${companyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCompanies(companies => companies.filter(c => c.id !== companyId));
      setSuccess('Company deleted successfully!');
      setTimeout(() => setSuccess(''), 1500);
    } catch (e) {
      setError('Failed to delete company');
      setTimeout(() => setError(''), 1500);
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">Manage Companies</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={4}>
        {companies.map((company, idx) => (
          <Grow in={true} timeout={500 + idx * 100} key={company.id}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  boxShadow: 4,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: 8,
                    borderColor: 'primary.main',
                  },
                  border: '2px solid #e3eafc',
                  bgcolor: '#fafdff',
                  minHeight: 350
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 3 }}>
                  <CardMedia
                    component="img"
                    height="90"
                    image={company.logo_url || 'https://via.placeholder.com/140'}
                    alt={company.name}
                    sx={{ objectFit: 'contain', bgcolor: '#f5f5f5', borderRadius: 2, width: 90, height: 90, boxShadow: 2 }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} color="primary.dark" sx={{ mb: 0.5 }}>{company.name}</Typography>
                  <Chip label={company.industry} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 48 }}>{company.description?.slice(0, 80)}...</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                    <Chip
                      label={company.status ? 'Active' : 'Inactive'}
                      color={company.status ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 700, px: 1.5, letterSpacing: 1, bgcolor: company.status ? '#e8f5e9' : '#ffebee', color: company.status ? '#388e3c' : '#d32f2f' }}
                    />
                    <Box flexGrow={1} />
                    <IconButton size="small" color="primary" onClick={() => onEdit(company.id)} sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteCompany(company.id)} sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}><DeleteIcon /></IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grow>
        ))}
      </Grid>
    </Container>
  );
} 