import React, { useState, useCallback, useRef } from 'react';
import { uploadDocument, AnalysisResult } from '../services/api';
import { 
  Box, Typography, Button, CircularProgress, 
  Paper, List, ListItem, ListItemText, Divider,
  Alert, Chip, TextField, IconButton, Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';

// Styled components
const MessageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: '80%',
  borderRadius: 12,
}));

const UserMessage = styled(MessageContainer)(({ theme }) => ({
  backgroundColor: '#e1f5fe',
  alignSelf: 'flex-end',
  borderTopRightRadius: 4,
}));

const BotMessage = styled(MessageContainer)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  alignSelf: 'flex-start',
  borderTopLeftRadius: 4,
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}));

const MessagesArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

// Message types for our chat
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: React.ReactNode;
}

const DocumentUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: (
        <Typography>
          Welcome to MedScript AI! Upload a medical document, and I'll analyze it for you.
        </Typography>
      )
    }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
      
      // Add a message showing the selected file
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'user',
        content: (
          <Box>
            <Typography variant="body1">
              I've selected a document for analysis: <strong>{file.name}</strong>
            </Typography>
          </Box>
        )
      }]);
      
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    // Add a message showing the upload action
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: (
        <Typography>
          Please analyze this document for me.
        </Typography>
      )
    }]);
    
    setTimeout(scrollToBottom, 100);
    
    setIsLoading(true);
    setError(null);
    
    // Add a "thinking" message
    const thinkingMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: thinkingMsgId,
      type: 'bot',
      content: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Analyzing your document...</Typography>
        </Box>
      )
    }]);
    
    setTimeout(scrollToBottom, 100);
    
    try {
      const result = await uploadDocument(selectedFile);
      setAnalysisResult(result);
      
      // Remove the thinking message and add the result
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingMsgId);
        return [...filtered, {
          id: Date.now().toString(),
          type: 'bot',
          content: renderAnalysisResult(result)
        }];
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'An error occurred during upload.';
      setError(errorMsg);
      
      // Remove the thinking message and add the error
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingMsgId);
        return [...filtered, {
          id: Date.now().toString(),
          type: 'bot',
          content: (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errorMsg}
            </Alert>
          )
        }];
      });
      
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedFile]);

  const renderAnalysisResult = (result: AnalysisResult) => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Analysis Complete
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Document Type:</strong> {result.document_type}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Summary:</strong> {result.summary}
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
          Key Findings:
        </Typography>
        <List dense disablePadding>
          {result.key_findings.map((finding, index) => (
            <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
              <ListItemText primary={finding} />
            </ListItem>
          ))}
        </List>
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
          Extracted Entities:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {result.extracted_entities.map((entity, index) => (
            <Chip 
              key={index}
              label={`${entity.entity_type}: ${entity.entity_value}`}
              size="small"
              variant="outlined"
              title={`Confidence: ${entity.confidence_score.toFixed(2)}`}
            />
          ))}
        </Stack>
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Safety Assessment:
        </Typography>
        <List dense>
          {result.safety_assessment.map((alert, index) => (
            <ListItem key={index} sx={{ 
              py: 1, 
              bgcolor: alert.severity === 'critical' ? '#ffebee' : 
                      alert.severity === 'major' ? '#fff8e1' : 'transparent',
              borderRadius: 1,
              mb: 1
            }}>
              <ListItemText 
                primary={
                  <Typography fontWeight="bold" color={
                    alert.severity === 'critical' ? 'error' : 
                    alert.severity === 'major' ? 'warning' : 'inherit'
                  }>
                    {alert.title} ({alert.severity})
                  </Typography>
                }
                secondary={
                  <>
                    {alert.description}
                    {alert.action_required && 
                      <Typography component="span" sx={{ display: 'block', fontStyle: 'italic', mt: 0.5 }}>
                        Action Required
                      </Typography>
                    }
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <ChatContainer>
      <MessagesArea>
        {messages.map((message) => (
          message.type === 'user' ? (
            <UserMessage key={message.id} elevation={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PersonIcon color="primary" />
                <Box>{message.content}</Box>
              </Box>
            </UserMessage>
          ) : (
            <BotMessage key={message.id} elevation={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <SmartToyIcon color="secondary" />
                <Box>{message.content}</Box>
              </Box>
            </BotMessage>
          )
        ))}
        <div ref={messagesEndRef} />
      </MessagesArea>
      
      <InputArea>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
        <IconButton 
          color="primary" 
          onClick={triggerFileInput}
          disabled={isLoading}
        >
          <AttachFileIcon />
        </IconButton>
        
        <TextField
          fullWidth
          placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "No file selected"}
          disabled
          variant="outlined"
          size="small"
        />
        
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleFileUpload}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </InputArea>
    </ChatContainer>
  );
};

export default DocumentUpload;
