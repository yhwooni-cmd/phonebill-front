import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button 
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title,
  message,
  severity = 'error',
  onRetry,
  retryLabel = '다시 시도'
}) => {
  return (
    <Box sx={{ py: 2 }}>
      <Alert 
        severity={severity}
        sx={{ mb: onRetry ? 2 : 0 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
      
      {onRetry && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRetry}
            size="small"
          >
            {retryLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
};