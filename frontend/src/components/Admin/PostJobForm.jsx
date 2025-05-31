import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, MenuItem, Stack, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const jobTypes = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Remote',
];

export default function PostJobForm({ editId, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editJobId = queryParams.get('edit');
  const isEdit = !!editId;

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    jobType: '',
    experience: '',
    skills: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          const response = await axios.get(`/api/jobs/${editId}`);
          const job = response.data;
          setForm({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            salary: job.salary || '',
            jobType: job.job_type || '',
            experience: job.experience || '',
            skills: Array.isArray(job.tags) ? job.tags.join(', ') : '',
          });
        } catch (e) {
          setError('Failed to fetch job details');
        }
      };
      fetchJob();
    }
  }, [editId, isEdit]);

  if (!user || !(user.is_admin || user.role === 'admin' || user.role === 'Super Admin' || (user.sub && user.sub.is_admin))) {
    return <Container sx={{ mt: 6 }}><Alert severity="error">Unauthorized: Only admins can post jobs.</Alert></Container>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    if (!form.title || !form.description || !form.location || !form.salary || !form.jobType || !form.experience || !form.skills) {
      setError('Please fill all fields.'); setLoading(false); return;
    }
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        salary: form.salary,
        job_type: form.jobType,
        experience: form.experience,
        company: user.company || 'NammaJobs',
        tags: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (isEdit) {
        await axios.put(`/api/jobs/${editId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setSuccess('Job updated successfully!');
      } else {
        await axios.post('/api/jobs', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setSuccess('Job posted successfully!');
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={3} align="center">
          {isEdit ? 'Edit Job' : 'Add New Job'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Job Title" name="title" value={form.title} onChange={handleChange} fullWidth required />
            <TextField label="Job Description" name="description" value={form.description} onChange={handleChange} fullWidth required multiline rows={4} />
            <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth required />
            <TextField label="Salary Range" name="salary" value={form.salary} onChange={handleChange} fullWidth required />
            <TextField select label="Job Type" name="jobType" value={form.jobType} onChange={handleChange} fullWidth required>
              {jobTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
            <TextField label="Experience Required" name="experience" value={form.experience} onChange={handleChange} fullWidth required />
            <TextField label="Skills Required (comma separated)" name="skills" value={form.skills} onChange={handleChange} fullWidth required />
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} sx={{ fontWeight: 700 }}>
              {loading ? 'Posting...' : (isEdit ? 'Update Job' : 'Post Job')}
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
} 