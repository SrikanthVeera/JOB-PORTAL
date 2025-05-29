import React from 'react';
import { AppBar, Toolbar, Stack, Avatar, InputBase, IconButton, Box, Button, Typography, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const logoUrl = '/logo/nammajobs-logo.png';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    // You can implement admin search logic here
    // For now, just log the search
    if (search.trim()) {
      // Example: navigate(`/admin/search?query=${encodeURIComponent(search)}`);
      console.log('Admin search:', search);
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#222', borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        {/* Logo */}
        <Stack direction="row" spacing={2} alignItems="center">
          <img src={logoUrl} alt="NammaJobs Logo" style={{ height: 40, marginRight: 4, cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2563eb', letterSpacing: 1, mr: 2 }}>
            NammaJobs
          </Typography>
        </Stack>
        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 320, borderRadius: 6, boxShadow: '0 1px 8px #0001', mr: 3, bgcolor: '#fff' }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search admin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '8px', color: '#2563eb' }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 