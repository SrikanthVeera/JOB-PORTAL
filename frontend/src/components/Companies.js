import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Stack, Chip, IconButton, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    } catch (e) {
      alert('Failed to delete company');
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Companies</Typography>
      <Grid container spacing={2}>
        {companies.map(company => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 1,
                minHeight: 220,
                transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s',
                '&:hover': {
                  transform: 'scale(1.035)',
                  boxShadow: 6,
                  bgcolor: '#f0f6ff',
                  borderColor: '#1976d2',
                },
                bgcolor: '#fff',
                border: '1.5px solid #e3eafc',
                p: 0,
                m: 0,
              }}
            >
              <CardMedia
                component="img"
                height="80"
                image={company.logo_url || 'https://via.placeholder.com/140'}
                alt={company.name}
                sx={{ objectFit: 'contain', bgcolor: '#f5faff', p: 1, borderRadius: 2, mt: 2, mx: 'auto', width: 60, height: 60 }}
              />
              <CardContent sx={{ p: 2, pt: 1 }}>
                <Typography variant="h6" fontWeight={700} color="#1976d2" sx={{ fontSize: 18, mb: 0.5 }}>{company.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{company.industry}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: 13, mt: 0.5 }}>{company.description?.slice(0, 60)}...</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Chip label={company.status ? 'Active' : 'Inactive'} color={company.status ? 'success' : 'default'} size="small" />
                </Stack>
              </CardContent>
              <Box sx={{ p: 1, pt: 0, textAlign: 'center' }}>
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    bgcolor: '#1976d2',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    fontSize: 13,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#125ea2' },
                    transition: 'all 0.18s',
                  }}
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(company.name)}`, '_blank')}
                >
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 