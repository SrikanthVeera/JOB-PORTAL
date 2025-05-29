import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StarIcon from '@mui/icons-material/Star';

const featuredIdx = 2; // Example: highlight the 3rd job as featured

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [saved, setSaved] = useState({});
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
      } catch (error) {
        setJobs([]);
      }
    };
    fetchJobs();
  }, []);

  const handleSave = (id) => {
    setSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Debug: log user object
  console.log('JobList user:', user);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Recommended jobs for you
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Profile (${jobs.length})`} />
          <Tab label="Preferences (0)" />
        </Tabs>
      </Box>
      {tab === 0 && (
        <Grid container spacing={2}>
          {jobs.map((job, idx) => {
            const isFeatured = idx === featuredIdx;
            return (
              <Grid item xs={12} key={job.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: isFeatured ? 4 : 1,
                    bgcolor: isFeatured ? '#fffbe6' : '#fff',
                    p: 2.5,
                    mb: 1.5,
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* Left: Checkbox (optional) */}
                    {/* <Checkbox /> */}
                    {/* Main Content */}
                    <Box flex={1} minWidth={0}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 1 }}>
                          {job.title}
                        </Typography>
                        {/* Company logo/avatar on right for mobile, left for desktop */}
                        <Box sx={{ display: { xs: 'block', sm: 'none' }, ml: 'auto' }}>
                          <Avatar
                            src={job.company_logo ? job.company_logo : undefined}
                            alt={job.company || 'Company'}
                            sx={{ width: 40, height: 40, bgcolor: '#f3f4f6', color: '#888', fontSize: 20 }}
                          >
                            {job.company?.[0] ? job.company[0].toUpperCase() : <WorkOutlineIcon />}
                          </Avatar>
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {job.company}
                        </Typography>
                        <StarIcon sx={{ color: '#fbc02d', fontSize: 18, ml: 1, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                          {job.rating || (3.7 + (idx % 2) * 0.5)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {job.reviews || `${1000 + idx * 100} Reviews`}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {job.date_posted || '2 days ago'}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          0-2 Yrs
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {job.salary ? `₹${job.salary}` : 'Not disclosed'}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationOnIcon sx={{ fontSize: 16, color: '#888' }} />
                          <Typography variant="caption" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
                        {Array.isArray(job.tags) && job.tags.slice(0, 5).map((tag, i) => (
                          <Chip key={i} label={tag} size="small" sx={{ mb: 0.5 }} />
                        ))}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 0.5 }}>
                        {job.description?.slice(0, 120)}{job.description && job.description.length > 120 ? '...' : ''}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ color: '#888', fontWeight: 700, borderRadius: 2 }}
                        >
                          Hide
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ color: '#1976d2', fontWeight: 700, borderRadius: 2 }}
                          onClick={() => handleSave(job.id)}
                          startIcon={saved[job.id] ? <BookmarkIcon sx={{ color: '#1976d2' }} /> : <BookmarkBorderIcon sx={{ color: '#888' }} />}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, borderRadius: 2, ml: 1 }}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          Apply
                        </Button>
                      </Stack>
                    </Box>
                    {/* Right: Company logo/avatar for desktop */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 2 }}>
                      <Avatar
                        src={job.company_logo ? job.company_logo : undefined}
                        alt={job.company || 'Company'}
                        sx={{ width: 48, height: 48, bgcolor: '#f3f4f6', color: '#888', fontSize: 24 }}
                      >
                        {job.company?.[0] ? job.company[0].toUpperCase() : <WorkOutlineIcon />}
                      </Avatar>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      {tab === 1 && (
        <Box sx={{ p: 4, textAlign: 'center', color: '#888' }}>
          No preferences set yet.
        </Box>
      )}
    </Container>
  );
}

export default JobList; 