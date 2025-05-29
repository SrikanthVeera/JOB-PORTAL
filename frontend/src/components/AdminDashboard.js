import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Alert, Card, CardContent, Grid, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Avatar, Divider, useTheme, useMediaQuery
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminCompanies from './Admin/AdminCompanies';
import JobListAdmin from './Admin/JobList';
import PostJobForm from './Admin/PostJobForm';
import CompanyForm from './Admin/CompanyForm';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

export default function AdminDashboard() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [job, setJob] = useState({
    title: '', company: '', location: '', salary: '', description: '', tags: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editJobId, setEditJobId] = useState(null);
  const [editCompanyId, setEditCompanyId] = useState(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [resumeCount, setResumeCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [uploadsCount, setUploadsCount] = useState(0);

  useEffect(() => {
    const fetchResumes = async () => {
      if (user?.is_admin) {
        try {
          const res = await axios.get('/api/applications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setResumeCount(Array.isArray(res.data) ? res.data.length : 0);
          setApplications(Array.isArray(res.data) ? res.data : []);
          console.log('Fetched applications:', res.data);
        } catch {
          setResumeCount(0);
          setApplications([]);
        }
      }
    };
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/api/jobs');
        setJobs(Array.isArray(res.data.jobs) ? res.data.jobs : []);
      } catch {
        setJobs([]);
      }
    };
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('/api/companies');
        setCompanies(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCompanies([]);
      }
    };
    const fetchUploadsCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/uploads/count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUploadsCount(res.data.count || 0);
      } catch {
        setUploadsCount(0);
      }
    };
    fetchResumes();
    fetchJobs();
    fetchCompanies();
    fetchUploadsCount();
  }, [user]);

  // Calculate active/expired jobs (if jobs have a status or date field)
  const activeJobs = jobs.filter(j => j.status === true || j.status === 'active' || j.status === 1).length;
  const expiredJobs = jobs.length - activeJobs;

  // Calculate new applications today (if applications have a date field)
  const today = new Date().toISOString().slice(0, 10);
  const newAppsToday = applications.filter(app => app.created_at && app.created_at.slice(0, 10) === today).length;
  // If no created_at field, fallback to 0

  // Example stats (replace with real data from API if available)
  const stats = [
    { label: 'Total Jobs Posted', value: jobs.length, icon: <WorkIcon sx={{ fontSize: 48, color: '#1976d2' }} />, onClick: () => setActivePanel('jobs') },
    { label: 'Total Companies', value: companies.length, icon: <BusinessIcon sx={{ fontSize: 48, color: '#388e3c' }} />, onClick: () => setActivePanel('companies') },
    { label: 'Total Resumes', value: uploadsCount, icon: <FolderIcon sx={{ fontSize: 48, color: '#1976d2' }} />, onClick: () => setActivePanel('resumes') },
    { label: 'New Applications Today', value: newAppsToday, icon: <AssignmentIcon sx={{ fontSize: 48, color: '#1976d2' }} /> },
  ];

  const sidebarItems = [
    { text: 'Dashboard', icon: <HomeIcon />, onClick: () => setActivePanel('dashboard') },
    { text: 'Post Job', icon: <AddBoxIcon />, onClick: () => setOpen(true) },
    { text: 'Manage Jobs', icon: <WorkIcon />, onClick: () => setActivePanel('jobs') },
    { text: 'Manage Companies', icon: <BusinessIcon />, onClick: () => setActivePanel('companies') },
    { text: 'View Resumes', icon: <FolderIcon />, onClick: () => setActivePanel('resumes') },
    { text: 'Logout', icon: <LogoutIcon />, onClick: () => { localStorage.removeItem('token'); navigate('/login'); } },
  ];

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handlePost = async () => {
    setSuccess(''); setError('');
    try {
      await axios.post('/api/jobs', {
        ...job,
        tags: job.tags.split(',').map(t => t.trim()),
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSuccess('Job posted successfully!');
      setJob({ title: '', company: '', location: '', salary: '', description: '', tags: '' });
      setOpen(false);
    } catch (e) {
      setError('Failed to post job');
    }
  };

  const handleProfileMenuOpen = (event) => setProfileMenuAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchor(null);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f7f8fa' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#fff', borderRight: '1.5px solid #e3eafc' },
        }}
      >
        <Toolbar sx={{ minHeight: 80 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48, cursor: 'pointer' }} onClick={() => setActivePanel('dashboard')}>
              {user?.full_name?.[0] || 'A'}
            </Avatar>
            <Box sx={{ cursor: 'pointer' }} onClick={() => setActivePanel('dashboard')}>
              <Typography fontWeight={700}>{user?.full_name || 'Admin'}</Typography>
              <Typography variant="body2" color="text.secondary">Admin</Typography>
            </Box>
          </Stack>
        </Toolbar>
        <Divider />
        <List>
          {sidebarItems.map((item, idx) => (
            <ListItem button key={item.text} onClick={item.onClick} sx={{ my: 0.5, borderRadius: 2 }}>
              <ListItemIcon sx={{ color: '#1976d2' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        {/* Top Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#222', borderBottom: '1.5px solid #e3eafc' }}>
          <Toolbar sx={{ minHeight: 80, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight={700} color="#1976d2">Admin Dashboard</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton color="primary">
                <NotificationsIcon />
              </IconButton>
              <IconButton color="primary" onClick={handleProfileMenuOpen}>
                <AccountCircleIcon sx={{ fontSize: 40 }} />
              </IconButton>
              <Menu anchorEl={profileMenuAnchor} open={Boolean(profileMenuAnchor)} onClose={handleProfileMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem disabled>{user?.full_name || 'Admin'}</MenuItem>
                <MenuItem disabled>{user?.email || ''}</MenuItem>
                <MenuItem onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Logout</MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content */}
        {activePanel === 'dashboard' && (
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
              {stats.map((stat, idx) => (
                <Grid item xs={12} sm={6} md={4} key={stat.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        p: 3,
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
                        bgcolor: '#fff',
                        border: '1.5px solid #e3eafc',
                        transition: 'transform 0.2s',
                        cursor: stat.onClick ? 'pointer' : 'default',
                        '&:hover': stat.onClick ? {
                          transform: 'translateY(-6px) scale(1.04)',
                          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.16)',
                          bgcolor: '#f5faff',
                        } : {},
                      }}
                      onClick={stat.onClick}
                    >
                      <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                      <Typography variant="subtitle1" fontWeight={700} align="center" sx={{ mb: 1, color: '#222' }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h3" fontWeight={800} align="center" sx={{ color: '#222' }}>
                        {stat.value}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          </Container>
        )}
        {activePanel === 'companies' && (
          <AdminCompanies
            onEdit={id => { setEditCompanyId(id); setCompanyDialogOpen(true); }}
          />
        )}
        {activePanel === 'jobs' && (
          <JobListAdmin onEdit={id => setEditJobId(id)} />
        )}
        {activePanel === 'resumes' && (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" fontWeight={700} mb={3}>All Job Applications</Typography>
            {applications.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {/* Download all resumes as zip (if backend supports) */}
                {/* <Button variant="contained" color="primary" sx={{ fontWeight: 700 }} onClick={handleDownloadAllResumes}>Download All Resumes</Button> */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>All Uploaded Resumes:</Typography>
                <Stack spacing={1}>
                  {applications.map(app => (
                    <Button key={app.id} variant="outlined" size="small" href={app.resume_path?.replace('uploads', '/uploads')} target="_blank">
                      {app.user?.email || 'User'} - {app.job?.title || 'Job'} Resume
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
            {applications.length === 0 ? (
              <Alert severity="info">
                No applications found.<br />
                {resumeCount === 0 && 'Tip: Make sure you have posted at least one job as admin and applied as a user.'}
              </Alert>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0001' }}>
                  <thead>
                    <tr style={{ background: '#f7f8fa' }}>
                      <th style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>Applicant</th>
                      <th style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>Email</th>
                      <th style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>Job Title</th>
                      <th style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>Status</th>
                      <th style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>{app.user?.email?.split('@')[0] || 'N/A'}</td>
                        <td style={{ padding: 12 }}>{app.user?.email || 'N/A'}</td>
                        <td style={{ padding: 12 }}>{app.job?.title || 'N/A'}</td>
                        <td style={{ padding: 12 }}>{app.status}</td>
                        <td style={{ padding: 12 }}>
                          <Button variant="outlined" size="small" href={app.resume_path?.replace('uploads', '/uploads')} target="_blank">View Resume</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Container>
        )}
      </Box>

      {/* Post Job Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Post New Job</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Job Title" name="title" value={job.title} onChange={handleChange} fullWidth required />
            <TextField label="Company" name="company" value={job.company} onChange={handleChange} fullWidth required />
            <TextField label="Location" name="location" value={job.location} onChange={handleChange} fullWidth required />
            <TextField label="Salary" name="salary" value={job.salary} onChange={handleChange} fullWidth required />
            <TextField label="Description" name="description" value={job.description} onChange={handleChange} fullWidth multiline rows={3} />
            <TextField label="Tags (comma separated)" name="tags" value={job.tags} onChange={handleChange} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handlePost} variant="contained" sx={{ fontWeight: 600 }}>Post Job</Button>
        </DialogActions>
      </Dialog>

      {/* Job Edit Dialog */}
      <Dialog open={!!editJobId} onClose={() => setEditJobId(null)} maxWidth="sm" fullWidth>
        <PostJobForm editId={editJobId} onClose={() => setEditJobId(null)} />
      </Dialog>

      {/* Company Edit Dialog */}
      <Dialog open={companyDialogOpen} onClose={() => setCompanyDialogOpen(false)} maxWidth="sm" fullWidth>
        <CompanyForm editId={editCompanyId} onClose={() => setCompanyDialogOpen(false)} />
      </Dialog>

      {/* Debug Panel for Admins */}
      {user?.is_admin && (
        <Box sx={{ position: 'fixed', bottom: 0, left: drawerWidth, right: 0, zIndex: 1200, bgcolor: 'transparent', p: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700} color="#1976d2">Debug: Raw Jobs & Applications Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" color="text.secondary">Jobs from /api/jobs:</Typography>
              <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f7f8fa', padding: 8, borderRadius: 4 }}>{JSON.stringify(jobs, null, 2)}</pre>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Applications from /api/applications:</Typography>
              <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f7f8fa', padding: 8, borderRadius: 4 }}>{JSON.stringify(applications, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
} 