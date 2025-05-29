import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper } from '@mui/material';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ViewResumes() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    };
    fetchApplications();
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>All Uploaded Resumes</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Applicant</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Job Title</TableCell>
            <TableCell>Resume</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map(app => (
            <TableRow key={app.id}>
              <TableCell>{app.user?.id}</TableCell>
              <TableCell>{app.user?.email}</TableCell>
              <TableCell>{app.job?.title}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  href={app.resume_path.replace('uploads/', '/uploads/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  View/Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
} 