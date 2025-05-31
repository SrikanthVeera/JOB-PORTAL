import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Container, Grid, Chip, Stack, Paper, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const heroImage = 'https://image.shutterstock.com/image-vector/flat-vector-illustration-job-search-260nw-1055044370.jpg';
const tagColors = [
  '#ffe0c7', '#d6f5e3', '#e5d6f5', '#c7eaff', '#f5d6e0', '#e0e7ff'
];
const companyIcons = {
  Amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  Google: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  Dribbble: 'https://cdn-icons-png.flaticon.com/512/2111/2111402.png',
  Twitter: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
  Airbnb: 'https://cdn-icons-png.flaticon.com/512/2111/2111320.png',
  Apple: 'https://cdn-icons-png.flaticon.com/512/732/732229.png',
};

// Recommended Companies array (distinct from topFeatureCompanies)
const recommendedCompanies = [
  { name: 'Tata Consultancy Services', logo: 'https://logo.clearbit.com/tcs.com', industry: 'IT Services & Consulting' },
  { name: 'Infosys', logo: 'https://logo.clearbit.com/infosys.com', industry: 'IT Services & Consulting' },
  { name: 'Wipro', logo: 'https://logo.clearbit.com/wipro.com', industry: 'IT Services & Consulting' },
  { name: 'Google', logo: 'https://logo.clearbit.com/google.com', industry: 'Software Product' },
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', industry: 'E-commerce' },
  { name: 'Zoho', logo: 'https://logo.clearbit.com/zoho.com', industry: 'Software Product' },
  { name: 'Paytm', logo: 'https://logo.clearbit.com/paytm.com', industry: 'Fintech' },
  { name: 'Flipkart', logo: 'https://logo.clearbit.com/flipkart.com', industry: 'E-commerce' },
];

// Top Feature Companies array (12+)
const topFeatureCompanies = [
  { name: 'Conexus', logo: 'https://logo.clearbit.com/conexussolutions.com' },
  { name: 'Replicon', logo: 'https://logo.clearbit.com/replicon.com' },
  { name: 'Pelatro', logo: 'https://logo.clearbit.com/pelatro.com' },
  { name: 'Examroom.ai', logo: 'https://logo.clearbit.com/examroom.ai' },
  { name: 'Dun & Bradstreet', logo: 'https://logo.clearbit.com/dnb.com' },
  { name: 'HDFC Life', logo: 'https://logo.clearbit.com/hdfclife.com' },
  { name: 'Tata AIG', logo: 'https://logo.clearbit.com/tataaig.com' },
  { name: 'Berger Paints', logo: 'https://logo.clearbit.com/bergerpaints.com' },
  { name: 'MindCraft', logo: 'https://logo.clearbit.com/mindcraft.com' },
  { name: 'Yara', logo: 'https://logo.clearbit.com/yara.com' },
  { name: 'CAMS', logo: 'https://logo.clearbit.com/cams.com' },
  { name: 'Tata Chemicals', logo: 'https://logo.clearbit.com/tatachemicals.com' },
  { name: 'WhiteHat Jr', logo: 'https://logo.clearbit.com/whitehatjr.com' },
  { name: 'BYJUS', logo: 'https://logo.clearbit.com/byjus.com' },
  { name: 'upGrad', logo: 'https://logo.clearbit.com/upgrad.com' },
];

// Add footerLinks array (reuse from About.js)
const footerLinks = [
  { title: 'Company', links: ['About Us', 'Our Team', 'Press', 'Blog', 'Success Stories', 'Advertise With Us', 'Contact Us'] },
  { title: 'Candidates Zone', links: ['CEAT', 'Premium Membership', 'Placement Preparation', 'Jobs Roles & Responsibilities'] },
  { title: 'Employers Zone', links: ['Post Job for Free', 'End-to-End Recruitment', 'Campus Recruitment', 'Online Assessment', 'Resume Search'] },
  { title: 'Institutes Zone', links: ['Post Your Institute', 'Email/SMS Campaign', 'Banner Ads Campaign', 'Placement Assistant'] },
];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const [companyPage, setCompanyPage] = useState(0);
  const companiesPerPage = 10; // 5 per row, 2 rows
  const maxPage = Math.ceil(topFeatureCompanies.length / companiesPerPage) - 1;

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

  return (
    <Box sx={{ bgcolor: '#f7f8fa', minHeight: '100vh', pt: 0 }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: '#fff', pt: 8, pb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left Side: Text */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#43a047', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
                LET'S START YOUR CAREERS HERE!
              </Typography>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.15 }}>
                Looking for a career change? Browse our job listings now!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Mus vehicula dignissim quis si lorem libero cras pulvinar orci dapibus. Sagittis quisque orci pretium donec elit platea porta integer maecenas risus lobortis.
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {[1,2,3,4,5].map((n) => (
                    <Box
                      key={n}
                      component="img"
                      src={`https://randomuser.me/api/portraits/men/${n+30}.jpg`}
                      alt="member"
                      sx={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff', boxShadow: 1, ml: n === 1 ? 0 : -1.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', ml: 2 }}>
                  540 K+ Member Active
                </Typography>
              </Stack>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#43a047',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: 18,
                  boxShadow: '0 4px 16px #43a04722',
                  '&:hover': { bgcolor: '#388e3c' }
                }}
                onClick={() => navigate('/jobs')}
              >
                Browse Job
              </Button>
            </Grid>
            {/* Right Side: Image */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={heroImage}
                alt="Job Search Hero"
                style={{ width: 500, height: 350, borderRadius: 8, objectFit: 'cover', border: '6px solid #fff' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Top Feature Companies Section */}
      <Box sx={{ pt: 4, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={3} align="center">
            Top Feature Companies
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setCompanyPage(p => Math.max(0, p - 1))} disabled={companyPage === 0}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <IconButton onClick={() => setCompanyPage(p => Math.min(maxPage, p + 1))} disabled={companyPage === maxPage}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          <Grid container spacing={3}>
            {topFeatureCompanies.slice(companyPage * companiesPerPage, (companyPage + 1) * companiesPerPage).map((company, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={company.name}>
                <Box sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px #0001',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 100,
                  justifyContent: 'center',
                }}>
                  <img src={company.logo} alt={company.name} style={{ width: 90, height: 40, objectFit: 'contain', marginBottom: 12 }} />
                  <Typography variant="subtitle1" fontWeight={700} align="center">{company.name}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Recommended Companies Section */}
      <Box sx={{ pt: 2, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={3} align="center">
            Recommended Companies
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {recommendedCompanies.map(company => (
              <Grid item xs={12} sm={6} md={3} lg={2} key={company.name}>
                <Box sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px #0001',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 160,
                  justifyContent: 'center',
                }}>
                  <img src={company.logo} alt={company.name} style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 12 }} />
                  <Typography variant="subtitle1" fontWeight={700} align="center">{company.name}</Typography>
                  <Typography variant="body2" color="text.secondary" align="center" mb={1}>{company.industry}</Typography>
                  <Button variant="outlined" size="small" onClick={() => window.location.href = '/companies'}>Details</Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Job Cards Section */}
      <Box id="job-section" sx={{ pt: 6, pb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" fontWeight={700}>
              Recommended jobs
            </Typography>
            <Chip label={jobs.length} color="primary" sx={{ fontWeight: 700, fontSize: 18, px: 2 }} />
          </Box>
          <Grid container spacing={4}>
            {jobs.map((job, idx) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Paper elevation={3} sx={{
                  borderRadius: 4,
                  p: 3,
                  bgcolor: tagColors[idx % tagColors.length],
                  minHeight: 300,
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: '0 4px 24px #0001',
                }}>
                  {/* Date and Bookmark */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {job.date_posted || ''}
                    </Typography>
                    <IconButton size="small" sx={{ bgcolor: '#fff', borderRadius: '50%' }}>
                      <BookmarkBorderIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {/* Company and Logo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 1 }}>
                      {job.company}
                    </Typography>
                    <img
                      src={companyIcons[job.company] || 'https://cdn-icons-png.flaticon.com/512/565/565547.png'}
                      alt={job.company}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', padding: 2 }}
                    />
                  </Box>
                  {/* Job Title */}
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {job.title}
                  </Typography>
                  {/* Tags */}
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                    {Array.isArray(job.tags) && job.tags.map((tag, i) => (
                      <Chip key={i} label={tag} size="small" />
                    ))}
                  </Stack>
                  {/* Salary and Location */}
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    ₹{job.salary}/month
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {job.location}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ position: 'absolute', bottom: 24, right: 24, borderRadius: 3, fontWeight: 700, bgcolor: '#222', color: '#fff', '&:hover': { bgcolor: '#111' } }}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    Details
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Footer - always at the bottom */}
      <Box sx={{ bgcolor: '#222', color: '#fff', py: 4, mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {footerLinks.map(section => (
              <Grid item xs={12} sm={6} md={3} key={section.title}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>{section.title}</Typography>
                {section.links.map(link => <Typography key={link} variant="body2" color="#bbb">{link}</Typography>)}
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Follow us</Typography>
              <Stack direction="row" spacing={2} mb={2}>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} aria-label="Facebook"><i className="fab fa-facebook-f"></i></button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} aria-label="Twitter"><i className="fab fa-twitter"></i></button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} aria-label="YouTube"><i className="fab fa-youtube"></i></button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} aria-label="Instagram"><i className="fab fa-instagram"></i></button>
              </Stack>
              <Typography fontWeight={700} mb={1}>Connect with us on fingertips</Typography>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style={{ width: 140, marginTop: 8 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 