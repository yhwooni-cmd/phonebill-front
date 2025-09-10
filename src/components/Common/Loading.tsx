import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Backdrop 
} from '@mui/material';

interface LoadingProps {
  message?: string;
  backdrop?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = '로딩중...',
  backdrop = false,
  size = 'medium'
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 60;
      default: return 40;
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress 
        size={getSizeValue()}
        sx={{ color: 'primary.main' }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          textAlign="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (backdrop) {
    return (
      <Backdrop
        open
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};