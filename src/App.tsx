import React from 'react';
import DocumentUpload from './components/DocumentUpload';
import './App.css';
import { Box, Container, AppBar, Toolbar, Typography, Paper } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#10a37f' }}>
        <Toolbar>
          <MedicalServicesIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            MedScript AI
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <DocumentUpload />
        </Paper>
      </Container>
    </Box>
  );
};

export default App;
