import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  Stack, 
  Paper, 
  LinearProgress, 
  Divider,
  Grid,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Zoom,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import api from '../api';

export default function UserProfileForm() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [educationDialog, setEducationDialog] = useState({ open: false, data: null });
  const [experienceDialog, setExperienceDialog] = useState({ open: false, data: null });
  const [skillDialog, setSkillDialog] = useState({ open: false, data: null });
  const [projectDialog, setProjectDialog] = useState({ open: false, data: null });

  // Add state for dialog forms
  const [educationForm, setEducationForm] = useState({ degree: '', field: '', institution: '', year: '', grade: '' });
  const [experienceForm, setExperienceForm] = useState({ company: '', position: '', duration: '', description: '' });
  const [skillForm, setSkillForm] = useState({ name: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '' });

  // Add state for edit profile dialog and form
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    resume_headline: ''
  });

  // Pre-fill dialog forms on open
  useEffect(() => {
    if (educationDialog.open) {
      setEducationForm(educationDialog.data || { degree: '', field: '', institution: '', year: '', grade: '' });
    }
  }, [educationDialog]);
  useEffect(() => {
    if (experienceDialog.open) {
      setExperienceForm(experienceDialog.data || { company: '', position: '', duration: '', description: '' });
    }
  }, [experienceDialog]);
  useEffect(() => {
    if (skillDialog.open) {
      setSkillForm(skillDialog.data || { name: '' });
    }
  }, [skillDialog]);
  useEffect(() => {
    if (projectDialog.open) {
      setProjectForm(projectDialog.data
        ? { ...projectDialog.data, technologies: projectDialog.data.technologies?.join(', ') || '' }
        : { title: '', description: '', technologies: '' });
    }
  }, [projectDialog]);

  // Pre-fill edit form when dialog opens
  useEffect(() => {
    if (editProfileDialog && profile) {
      setEditProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        resume_headline: profile.resume_headline || ''
      });
    }
  }, [editProfileDialog, profile]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        // Fetch profile
        const profileRes = await api.get('/api/profile');
        setProfile(profileRes.data);
        
        // Fetch educations
        const educationsRes = await api.get('/api/profile/education');
        setEducations(educationsRes.data);
        
        // Fetch experiences
        const experiencesRes = await api.get('/api/profile/experience');
        setExperiences(experiencesRes.data);
        
        // Fetch skills
        const skillsRes = await api.get('/api/profile/skills');
        setSkills(skillsRes.data);
        
        // Fetch projects
        const projectsRes = await api.get('/api/profile/projects');
        setProjects(projectsRes.data);
        
      } catch (apiError) {
        if (apiError.response && apiError.response.status === 401) {
          navigate('/login');
          return;
        }
        throw apiError;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Education CRUD
  const handleAddEducation = async (data) => {
    try {
      await api.post('/api/profile/education', data);
      fetchProfileData();
      showSnackbar('Education added successfully');
    } catch (err) {
      console.error('Error adding education:', err);
      showSnackbar('Failed to add education', 'error');
    }
  };

  const handleUpdateEducation = async (id, data) => {
    try {
      await api.put(`/api/profile/education/${id}`, data);
      fetchProfileData();
      showSnackbar('Education updated successfully');
    } catch (err) {
      console.error('Error updating education:', err);
      showSnackbar('Failed to update education', 'error');
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await api.delete(`/api/profile/education/${id}`);
      fetchProfileData();
      showSnackbar('Education deleted successfully');
    } catch (err) {
      console.error('Error deleting education:', err);
      showSnackbar('Failed to delete education', 'error');
    }
  };

  // Experience CRUD
  const handleAddExperience = async (data) => {
    try {
      await api.post('/api/profile/experience', data);
      fetchProfileData();
      showSnackbar('Experience added successfully');
    } catch (err) {
      console.error('Error adding experience:', err);
      showSnackbar('Failed to add experience', 'error');
    }
  };

  const handleUpdateExperience = async (id, data) => {
    try {
      await api.put(`/api/profile/experience/${id}`, data);
      fetchProfileData();
      showSnackbar('Experience updated successfully');
    } catch (err) {
      console.error('Error updating experience:', err);
      showSnackbar('Failed to update experience', 'error');
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await api.delete(`/api/profile/experience/${id}`);
      fetchProfileData();
      showSnackbar('Experience deleted successfully');
    } catch (err) {
      console.error('Error deleting experience:', err);
      showSnackbar('Failed to delete experience', 'error');
    }
  };

  // Skills CRUD
  const handleAddSkill = async (data) => {
    try {
      await api.post('/api/profile/skills', data);
      fetchProfileData();
      showSnackbar('Skill added successfully');
    } catch (err) {
      console.error('Error adding skill:', err);
      showSnackbar('Failed to add skill', 'error');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await api.delete(`/api/profile/skills/${id}`);
      fetchProfileData();
      showSnackbar('Skill deleted successfully');
    } catch (err) {
      console.error('Error deleting skill:', err);
      showSnackbar('Failed to delete skill', 'error');
    }
  };

  // Projects CRUD
  const handleAddProject = async (data) => {
    try {
      await api.post('/api/profile/projects', data);
      fetchProfileData();
      showSnackbar('Project added successfully');
    } catch (err) {
      console.error('Error adding project:', err);
      showSnackbar('Failed to add project', 'error');
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      await api.put(`/api/profile/projects/${id}`, data);
      fetchProfileData();
      showSnackbar('Project updated successfully');
    } catch (err) {
      console.error('Error updating project:', err);
      showSnackbar('Failed to update project', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/api/profile/projects/${id}`);
      fetchProfileData();
      showSnackbar('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      showSnackbar('Failed to delete project', 'error');
    }
  };

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProfileSave = async () => {
    try {
      await api.put('/api/profile', editProfileForm);
      showSnackbar('Profile updated successfully');
      setEditProfileDialog(false);
      fetchProfileData();
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar('Failed to update profile', 'error');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box sx={{ color: 'error.main', textAlign: 'center', mt: 4 }}>{error}</Box>;
  }

  const ProfileSection = ({ title, icon, children }) => (
    <Fade in timeout={700}>
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 24px #2563eb22', bgcolor: '#fff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: '#2563eb' }}>
              {title}
            </Typography>
          </Box>
          {children}
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#fff', minHeight: '100vh', borderRadius: 5, boxShadow: '0 8px 40px #0002' }}>
      {/* Profile Header */}
      <Zoom in timeout={700}>
        <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 8px 32px #2563eb22' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Zoom in timeout={900}>
                <Avatar
                  src={profile?.imageUrl || 'https://via.placeholder.com/120x120.png?text=Job'}
                  sx={{ width: 120, height: 120, bgcolor: '#1976d2', fontSize: 48, fontWeight: 700, boxShadow: '0 4px 16px #2563eb22' }}
                >
                  {!profile?.imageUrl && (profile?.full_name?.[0] || 'U')}
                </Avatar>
              </Zoom>
            </Grid>
            <Grid item xs={12} md={9}>
              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {profile?.full_name || 'User'}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {profile?.resume_headline || 'Add your resume headline'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  <Chip icon={<LocationOnIcon />} label={profile?.location || 'Add location'} color="primary" />
                  <Chip icon={<EmailIcon />} label={profile?.email || 'Add email'} color="primary" />
                  <Chip icon={<PhoneIcon />} label={profile?.phone || 'Add phone'} color="primary" />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Zoom>

      {/* Education Section */}
      <ProfileSection title="Education" icon={<SchoolIcon color="primary" />}>
        {educations.map((edu) => (
          <Box key={edu.id} sx={{ mb: 2, position: 'relative' }}>
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 0, top: 0 }}
              onClick={() => handleDeleteEducation(edu.id)}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              {edu.degree} in {edu.field}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {edu.institution} • {edu.year}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Grade: {edu.grade}
            </Typography>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => setEducationDialog({ open: true, data: null })}
        >
          Add Education
        </Button>
      </ProfileSection>

      {/* Experience Section */}
      <ProfileSection title="Work Experience" icon={<WorkIcon color="primary" />}>
        {experiences.map((exp) => (
          <Box key={exp.id} sx={{ mb: 2, position: 'relative' }}>
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 0, top: 0 }}
              onClick={() => handleDeleteExperience(exp.id)}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              {exp.position}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exp.company} • {exp.duration}
            </Typography>
            <Typography variant="body2">
              {exp.description}
            </Typography>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => setExperienceDialog({ open: true, data: null })}
        >
          Add Experience
        </Button>
      </ProfileSection>

      {/* Skills Section */}
      <ProfileSection title="Skills" icon={<CodeIcon color="primary" />}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill) => (
            <Chip
              key={skill.id}
              label={skill.name}
              onDelete={() => handleDeleteSkill(skill.id)}
              sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
            />
          ))}
        </Box>
        <Button
          startIcon={<AddIcon />}
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => setSkillDialog({ open: true, data: null })}
        >
          Add Skills
        </Button>
      </ProfileSection>

      {/* Projects Section */}
      <ProfileSection title="Projects" icon={<LanguageIcon color="primary" />}>
        {projects.map((project) => (
          <Box key={project.id} sx={{ mb: 2, position: 'relative' }}>
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 0, top: 0 }}
              onClick={() => handleDeleteProject(project.id)}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              {project.title}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {project.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {project.technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  size="small"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              ))}
            </Box>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => setProjectDialog({ open: true, data: null })}
        >
          Add Project
        </Button>
      </ProfileSection>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setEditProfileDialog(true)}
          sx={{ px: 4 }}
        >
          Edit Profile
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{ px: 4 }}
        >
          Logout
        </Button>
      </Box>

      {/* Education Dialog */}
      <Dialog open={educationDialog.open} onClose={() => setEducationDialog({ open: false, data: null })}>
        <DialogTitle>{educationDialog.data ? 'Edit Education' : 'Add Education'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Degree"
              fullWidth
              value={educationForm.degree}
              onChange={e => setEducationForm({ ...educationForm, degree: e.target.value })}
            />
            <TextField
              label="Field of Study"
              fullWidth
              value={educationForm.field}
              onChange={e => setEducationForm({ ...educationForm, field: e.target.value })}
            />
            <TextField
              label="Institution"
              fullWidth
              value={educationForm.institution}
              onChange={e => setEducationForm({ ...educationForm, institution: e.target.value })}
            />
            <TextField
              label="Year"
              fullWidth
              value={educationForm.year}
              onChange={e => setEducationForm({ ...educationForm, year: e.target.value })}
            />
            <TextField
              label="Grade"
              fullWidth
              value={educationForm.grade}
              onChange={e => setEducationForm({ ...educationForm, grade: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEducationDialog({ open: false, data: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (educationDialog.data) {
                handleUpdateEducation(educationDialog.data.id, educationForm);
              } else {
                handleAddEducation(educationForm);
              }
              setEducationDialog({ open: false, data: null });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={experienceDialog.open} onClose={() => setExperienceDialog({ open: false, data: null })}>
        <DialogTitle>{experienceDialog.data ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Company"
              fullWidth
              value={experienceForm.company}
              onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })}
            />
            <TextField
              label="Position"
              fullWidth
              value={experienceForm.position}
              onChange={e => setExperienceForm({ ...experienceForm, position: e.target.value })}
            />
            <TextField
              label="Duration"
              fullWidth
              value={experienceForm.duration}
              onChange={e => setExperienceForm({ ...experienceForm, duration: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={experienceForm.description}
              onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialog({ open: false, data: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (experienceDialog.data) {
                handleUpdateExperience(experienceDialog.data.id, experienceForm);
              } else {
                handleAddExperience(experienceForm);
              }
              setExperienceDialog({ open: false, data: null });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Skill Dialog */}
      <Dialog open={skillDialog.open} onClose={() => setSkillDialog({ open: false, data: null })}>
        <DialogTitle>Add Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Skill Name"
              fullWidth
              value={skillForm.name}
              onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialog({ open: false, data: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleAddSkill(skillForm);
              setSkillDialog({ open: false, data: null });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={projectDialog.open} onClose={() => setProjectDialog({ open: false, data: null })}>
        <DialogTitle>{projectDialog.data ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Project Title"
              fullWidth
              value={projectForm.title}
              onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={projectForm.description}
              onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
            />
            <TextField
              label="Technologies (comma-separated)"
              fullWidth
              value={projectForm.technologies}
              onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialog({ open: false, data: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const techArr = projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean);
              if (projectDialog.data) {
                handleUpdateProject(projectDialog.data.id, { ...projectForm, technologies: techArr });
              } else {
                handleAddProject({ ...projectForm, technologies: techArr });
              }
              setProjectDialog({ open: false, data: null });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialog} onClose={() => setEditProfileDialog(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField
              label="Full Name"
              name="full_name"
              value={editProfileForm.full_name}
              onChange={handleEditProfileChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={editProfileForm.phone}
              onChange={handleEditProfileChange}
              fullWidth
            />
            <TextField
              label="Location"
              name="location"
              value={editProfileForm.location}
              onChange={handleEditProfileChange}
              fullWidth
            />
            <TextField
              label="Resume Headline"
              name="resume_headline"
              value={editProfileForm.resume_headline}
              onChange={handleEditProfileChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditProfileSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 