import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Stack, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function JobListAdmin({ onEdit }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
    } catch (e) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setJobs(jobs => jobs.filter(j => j.id !== jobId));
    } catch (e) {
      alert('Failed to delete job');
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Job List</Typography>
      <Grid container spacing={3}>
        {jobs.map(job => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary">{job.company}</Typography>
                <Typography variant="body2" color="text.secondary">{job.location}</Typography>
                <Typography variant="body2" color="text.secondary">{job.salary}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>{job.description?.slice(0, 80)}...</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <IconButton size="small" color="primary" onClick={() => onEdit(job.id)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteJob(job.id)}><DeleteIcon /></IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 