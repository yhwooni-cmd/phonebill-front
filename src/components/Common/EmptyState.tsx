import React from 'react';
import { 
  Box, 
  Typography, 
  Button 
} from '@mui/material';
import { SearchOff } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = <SearchOff sx={{ fontSize: 48, color: 'grey.400' }} />,
  title,
  message,
  actionLabel,
  onAction
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
      }}
    >
      {icon}
      
      {title && (
        <Typography
          variant="h6"
          sx={{ mt: 2, mb: 1, color: 'text.primary' }}
        >
          {title}
        </Typography>
      )}
      
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: actionLabel && onAction ? 3 : 0 }}
      >
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};