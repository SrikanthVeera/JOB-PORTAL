import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Badge,
  Avatar,
  InputBase,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserProfileForm from './UserProfileForm';
import Slide from '@mui/material/Slide';

const logoUrl = '/logo/nammajobs-logo.png';

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profileDialog, setProfileDialog] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [search, setSearch] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfileDialog(false);
    navigate('/login');
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };
  const openProfileDrawer = async () => {
    setProfileDialog(true);
    setLoadingProfile(true);
    try {
      const res = await axios.get('/api/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProfile(res.data);
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Calculate profile completion (simple example: name, phone, location)
  const getProfileCompletion = () => {
    if (!profile) return 0;
    let percent = 0;
    if (profile.full_name) percent += 33;
    if (profile.phone) percent += 33;
    if (profile.location) percent += 34;
    return percent;
  };

  return (
    <Slide in direction="down" timeout={700}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#fff',
          color: '#222',
          borderBottom: '1px solid #eee',
          boxShadow: '0 4px 24px #2563eb11',
          transition: 'box-shadow 0.3s',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
          {/* Left: Logo and Brand */}
          <Stack direction="row" spacing={2} alignItems="center">
            <img src={logoUrl} alt="NammaJobs Logo" style={{ height: 40, marginRight: 4, cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/')} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2563eb', letterSpacing: 1, mr: 2, transition: 'color 0.3s', cursor: 'pointer', position: 'relative', '&:hover': { color: '#43a047' } }} onClick={() => navigate('/')}>NammaJobs</Typography>
            {/* Hide nav links for admin */}
            {!user?.is_admin && <>
              <Button sx={{ color: '#222', fontWeight: 500, fontSize: 16, textTransform: 'none', position: 'relative', transition: 'color 0.3s', '&:hover': { color: '#2563eb' }, '&:after': { content: '""', display: 'block', width: '0%', height: 2, bgcolor: '#2563eb', transition: 'width 0.3s', position: 'absolute', left: 0, bottom: 0 }, '&:hover:after': { width: '100%' } }} onClick={() => navigate('/jobs')}>
                Jobs
                <Badge color="error" variant="dot" sx={{ position: 'absolute', top: 0, right: -10 }} badgeContent={1} />
              </Button>
              <Button sx={{ color: '#222', fontWeight: 500, fontSize: 16, textTransform: 'none', position: 'relative', transition: 'color 0.3s', '&:hover': { color: '#2563eb' }, '&:after': { content: '""', display: 'block', width: '0%', height: 2, bgcolor: '#2563eb', transition: 'width 0.3s', position: 'absolute', left: 0, bottom: 0 }, '&:hover:after': { width: '100%' } }} onClick={() => navigate('/companies')}>
                Companies
                <Badge color="error" variant="dot" sx={{ position: 'absolute', top: 0, right: -10 }} badgeContent={1} />
              </Button>
              <Button sx={{ color: '#222', fontWeight: 500, fontSize: 16, textTransform: 'none', position: 'relative', transition: 'color 0.3s', '&:hover': { color: '#2563eb' }, '&:after': { content: '""', display: 'block', width: '0%', height: 2, bgcolor: '#2563eb', transition: 'width 0.3s', position: 'absolute', left: 0, bottom: 0 }, '&:hover:after': { width: '100%' } }} onClick={() => navigate('/about')}>
                About
                <Badge color="error" variant="dot" sx={{ position: 'absolute', top: 0, right: -10 }} badgeContent={1} />
              </Button>
              <Button sx={{ color: '#2563eb', fontWeight: 600, fontSize: 16, textTransform: 'none', position: 'relative', transition: 'color 0.3s', '&:after': { content: '""', display: 'block', width: '0%', height: 2, bgcolor: '#2563eb', transition: 'width 0.3s', position: 'absolute', left: 0, bottom: 0 }, '&:hover:after': { width: '100%' } }} onClick={() => navigate('/my-applications')}>
                My Applications
              </Button>
            </>}
          </Stack>
          {/* Center: Search Bar */}
          {!user?.is_admin && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 320, borderRadius: 6, boxShadow: '0 1px 8px #0001', mr: 3 }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search jobs here"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: '8px', color: '#2563eb' }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Box>
          )}
          {/* Right: Special Button, Bell, Profile */}
          <Stack direction="row" spacing={2} alignItems="center">
            {!user?.is_admin && <>
              <Button
                variant="outlined"
                sx={{ borderColor: '#2563eb', color: '#2563eb', fontWeight: 700, borderRadius: 3, px: 2, fontSize: 16 }}
                onClick={() => navigate('/jobs')}
              >
                NammaJobs <span style={{ color: '#00b386', marginLeft: 2 }}>360</span>
              </Button>
              <IconButton>
                <NotificationsNoneIcon sx={{ fontSize: 28, color: '#888' }} />
              </IconButton>
            </>}
            {user ? (
              <IconButton onClick={() => navigate('/profile')} sx={{ p: 0, bgcolor: '#f3f4f6', borderRadius: 3, border: '1px solid #eee' }}>
                <Avatar sx={{ bgcolor: '#e5e7eb', color: '#888' }} />
              </IconButton>
            ) : (
              <>
                <Button
                  variant="text"
                  sx={{ color: '#222', fontWeight: 500, textTransform: 'none', fontSize: 16, px: 2 }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#2563eb',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: 16,
                    px: 2.5,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#174ea6' },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </Slide>
  );
}

export default Navbar; 