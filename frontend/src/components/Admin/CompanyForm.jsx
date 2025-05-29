import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, MenuItem, Stack, Alert, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Transportation',
  'Energy',
  'Other',
  'Software Product',
  'IT Services & Consulting',
  'Fintech',
  'E-commerce'
];

export default function CompanyForm({ editId, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editCompanyId = queryParams.get('edit');
  const isEdit = !!editId;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    description: '',
    status: true,
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchCompany = async () => {
        try {
          const response = await axios.get(`/api/companies/${editId}`);
          const company = response.data;
          setForm({
            name: company.name || '',
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || '',
            website: company.website || '',
            industry: company.industry || '',
            description: company.description || '',
            status: company.status || true,
            logo: null
          });
          if (company.logo_url) {
            setLogoPreview(company.logo_url);
          }
        } catch (e) {
          setError('Failed to fetch company details');
        }
      };
      fetchCompany();
    }
  }, [editId, isEdit]);

  if (!user || !(user.is_admin || user.role === 'admin' || user.role === 'Super Admin' || (user.sub && user.sub.is_admin))) {
    return <Container sx={{ mt: 6 }}><Alert severity="error">Unauthorized: Only admins can manage companies.</Alert></Container>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);

    if (!form.name || !form.email || !form.phone || !form.address || !form.industry || !form.description) {
      setError('Please fill all required fields.'); 
      setLoading(false); 
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'logo' && form[key]) {
          formData.append('logo', form[key]);
        } else {
          formData.append(key, form[key]);
        }
      });

      if (isEdit) {
        await axios.put(`/api/companies/${editId}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSuccess('Company updated successfully!');
      } else {
        await axios.post('/api/companies', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSuccess('Company added successfully!');
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={3} align="center">
          {isEdit ? 'Edit Company' : 'Add New Company'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField 
              label="Company Name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              fullWidth 
              required 
            />
            <TextField 
              label="Email" 
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange} 
              fullWidth 
              required 
            />
            <TextField 
              label="Phone Number" 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              fullWidth 
              required 
            />
            <TextField 
              label="Address" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              fullWidth 
              required 
              multiline 
              rows={2}
            />
            <TextField 
              label="Website" 
              name="website" 
              value={form.website} 
              onChange={handleChange} 
              fullWidth 
            />
            <TextField 
              select 
              label="Industry" 
              name="industry" 
              value={form.industry} 
              onChange={handleChange} 
              fullWidth 
              required
            >
              {industries.map(industry => (
                <MenuItem key={industry} value={industry}>{industry}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Company Description" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              fullWidth 
              required 
              multiline 
              rows={4}
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Upload Company Logo
                </Button>
              </label>
              {logoPreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img 
                    src={logoPreview} 
                    alt="Company Logo Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} 
                  />
                </Box>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={form.status}
                  onChange={handleChange}
                  name="status"
                  color="primary"
                />
              }
              label={form.status ? "Active" : "Inactive"}
            />
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large" 
              disabled={loading} 
              sx={{ fontWeight: 700 }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Company' : 'Add Company')}
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
} 