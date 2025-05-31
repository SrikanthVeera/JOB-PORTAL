import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axios.get('/api/my-applications', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setApps(res.data);
      } catch (e) {
        setApps([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await axios.delete(`/api/my-applications/${appId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setApps(apps => apps.filter(app => app.id !== appId));
    } catch (e) {
      alert('Failed to withdraw application');
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  console.log(apps);

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>My Applications</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Resume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.id}</TableCell>
                <TableCell>{app.job_title}</TableCell>
                <TableCell>{app.status}</TableCell>
                <TableCell>
                  <Button
                    href={
                      app.resume_path.startsWith('uploads/')
                        ? `/${app.resume_path}`
                        : `/uploads/${app.resume_path.replace(/^\\+|^\//, '')}`
                    }
                    target="_blank"
                    variant="outlined"
                    size="small"
                  >
                    View Resume
                  </Button>
                  <Button onClick={() => handleWithdraw(app.id)} color="error" variant="outlined" size="small" sx={{ ml: 1 }}>Withdraw</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
} 