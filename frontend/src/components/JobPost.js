import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function JobPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [openReferDialog, setOpenReferDialog] = useState(false);
  const [refereeEmail, setRefereeEmail] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [referSuccess, setReferSuccess] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    resume: null,
    coverLetter: '',
    linkedin: '',
    portfolio: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  const fetchJob = useCallback(async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Error loading job details');
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleApplyOpen = () => setApplyDialogOpen(true);
  const handleApplyClose = () => {
    setApplyDialogOpen(false);
    setApplyForm({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      resume: null,
      coverLetter: '',
      linkedin: '',
      portfolio: '',
    });
    setApplyError('');
    setApplySuccess('');
  };
  const handleApplyFormChange = (e) => {
    const { name, value, files } = e.target;
    setApplyForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
      setApplyError('You must be logged in to apply for a job.');
      setApplyLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 1200);
      return;
    }
    if (!applyForm.fullName || !applyForm.email || !applyForm.phone || !applyForm.resume) {
      setApplyError('Please fill all required fields and upload your resume.');
      setApplyLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('full_name', applyForm.fullName);
    formData.append('email', applyForm.email);
    formData.append('phone', applyForm.phone);
    formData.append('resume', applyForm.resume);
    formData.append('cover_letter', applyForm.coverLetter);
    formData.append('linkedin', applyForm.linkedin);
    formData.append('portfolio', applyForm.portfolio);
    formData.append('job_id', id);
    try {
      await axios.post('/api/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      setApplySuccess('Application submitted successfully!');
      setTimeout(() => {
        handleApplyClose();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setApplyError('Session expired. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setApplyError(error.response?.data?.error || 'Error submitting application');
      }
    } finally {
      setApplyLoading(false);
    }
  };

  const handleRefer = async () => {
    setReferSuccess('');
    try {
      await axios.post('/api/referrals', {
        job_id: job.id,
        referee_email: refereeEmail,
        message: referralMessage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReferSuccess('Referral sent successfully!');
      setRefereeEmail('');
      setReferralMessage('');
      setOpenReferDialog(false);
    } catch (error) {
      setReferSuccess('Error sending referral');
    }
  };

  if (!job) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        sx={{
          maxWidth: 700,
          mx: 'auto',
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: 6,
          background: 'linear-gradient(120deg, #f7faff 60%, #e3f0ff 100%)',
          mb: 6,
        }}
      >
        <Typography variant="h3" fontWeight={800} color="#222" sx={{ mb: 1, fontSize: { xs: 28, sm: 36 } }}>
          {job.title}
        </Typography>
        <Typography variant="h6" color="#1976d2" fontWeight={600} sx={{ mb: 0.5, fontSize: 20 }}>
          {job.location}
        </Typography>
        <Typography variant="h6" sx={{ color: '#00b386', fontWeight: 700, fontSize: 20, mb: 1 }}>
          Salary: {job.salary}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: 16, mb: 2 }}>
          {job.description}
        </Typography>

        {user && !user.is_admin && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                fontWeight: 800,
                borderRadius: 3,
                px: 5,
                py: 1.5,
                fontSize: 20,
                bgcolor: 'linear-gradient(90deg, #1976d2 60%, #00b386 100%)',
                color: '#fff',
                boxShadow: '0 4px 24px #1976d220',
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: 'all 0.18s',
                '&:hover': {
                  bgcolor: 'linear-gradient(90deg, #125ea2 60%, #00996b 100%)',
                  transform: 'scale(1.04)',
                  boxShadow: 8,
                },
              }}
              onClick={handleApplyOpen}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              APPLY FOR THIS JOB
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenReferDialog(true)}
              sx={{
                fontWeight: 700,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: 18,
                color: '#d90429',
                borderColor: '#d90429',
                ml: { xs: 0, sm: 2 },
                boxShadow: 'none',
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: 'all 0.18s',
                '&:hover': {
                  bgcolor: '#fff0f3',
                  borderColor: '#b91c1c',
                  color: '#b91c1c',
                  transform: 'scale(1.04)',
                },
              }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              REFER THIS JOB
            </Button>
          </Box>
        )}
        {referSuccess && <Alert severity={referSuccess.startsWith('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>{referSuccess}</Alert>}
      </Box>
      {/* Refer Job Dialog */}
      <Dialog open={openReferDialog} onClose={() => setOpenReferDialog(false)}>
        <DialogTitle>Refer this Job</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Friend's Email"
            value={refereeEmail}
            onChange={e => setRefereeEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Message (optional)"
            value={referralMessage}
            onChange={e => setReferralMessage(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReferDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRefer}
            color="primary"
            variant="contained"
          >
            Send Referral
          </Button>
        </DialogActions>
      </Dialog>
      {/* Job Apply Dialog */}
      <Dialog open={applyDialogOpen} onClose={handleApplyClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: 24,
          color: '#1976d2',
          textAlign: 'center',
          background: 'linear-gradient(90deg, #e3f0ff 0%, #f7faff 100%)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          pb: 2
        }}>
          Job Application
        </DialogTitle>
        <DialogContent
          sx={{
            background: 'linear-gradient(120deg, #f7faff 60%, #e3f0ff 100%)',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            p: { xs: 2, sm: 4 },
            minHeight: 420
          }}
        >
          <Box
            component={motion.form}
            onSubmit={handleApplySubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Full Name" name="fullName" value={applyForm.fullName} onChange={handleApplyFormChange} fullWidth required size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }} />
              <TextField label="Email Address" name="email" value={applyForm.email} onChange={handleApplyFormChange} fullWidth required type="email" size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }} />
              <TextField label="Phone Number" name="phone" value={applyForm.phone} onChange={handleApplyFormChange} fullWidth required type="tel" size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }} />
              <Button variant="outlined" component="label" sx={{ fontWeight: 600, borderRadius: 2, bgcolor: '#f7faff', borderColor: '#1976d2', color: '#1976d2', '&:hover': { bgcolor: '#e3f0ff' } }}>
                Upload Resume (PDF/DOC)
                <input type="file" name="resume" accept=".pdf,.doc,.docx" hidden onChange={handleApplyFormChange} />
              </Button>
              {applyForm.resume && <Typography variant="body2" color="text.secondary">{applyForm.resume.name}</Typography>}
              <TextField label="Cover Letter / Message (optional)" name="coverLetter" value={applyForm.coverLetter} onChange={handleApplyFormChange} fullWidth multiline rows={3} size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }} />
              <TextField label="LinkedIn Profile (optional)" name="linkedin" value={applyForm.linkedin} onChange={handleApplyFormChange} fullWidth size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }} />
              <TextField label="Portfolio Link (optional)" name="portfolio" value={applyForm.portfolio} onChange={handleApplyFormChange} fullWidth size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }} />
              {applyError && <Alert severity="error">{applyError}</Alert>}
              {applySuccess && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Alert severity="success" icon={false} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#1976d2', bgcolor: '#e3f0ff', border: '1.5px solid #1976d2', mt: 2 }}>
                    <span style={{ fontSize: 32, marginRight: 8, color: '#00b386' }}>✔</span> Application submitted successfully!
                  </Alert>
                </motion.div>
              )}
            </Stack>
            <DialogActions sx={{ px: 0, pt: 3, justifyContent: 'center' }}>
              <Button onClick={handleApplyClose} sx={{ fontWeight: 600, borderRadius: 2, color: '#1976d2', borderColor: '#1976d2' }} variant="outlined">Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  fontSize: 17,
                  background: 'linear-gradient(90deg, #1976d2 60%, #00b386 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 12px #1976d220',
                  '&:hover': { background: 'linear-gradient(90deg, #125ea2 60%, #00996b 100%)' },
                  transition: 'all 0.18s',
                }}
                disabled={applyLoading}
              >
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default JobPost; 