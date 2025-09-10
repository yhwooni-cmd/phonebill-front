import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box 
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = true, 
  onBack,
  actions 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderBottomColor: 'grey.200',
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important' }}>
        {showBackButton && (
          <IconButton
            edge="start"
            onClick={handleBack}
            sx={{ mr: 1, color: 'text.primary' }}
            aria-label="뒤로가기"
          >
            <ArrowBack />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          component="h1"
          sx={{ 
            flexGrow: 1,
            fontSize: '1.125rem',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {actions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};