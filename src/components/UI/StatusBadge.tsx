import React from 'react';
import { Chip } from '@mui/material';

type StatusType = 'processing' | 'completed' | 'failed' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'processing':
        return {
          label: label || '처리중',
          color: 'warning' as const,
        };
      case 'completed':
        return {
          label: label || '완료',
          color: 'success' as const,
        };
      case 'failed':
        return {
          label: label || '실패',
          color: 'error' as const,
        };
      case 'pending':
        return {
          label: label || '대기',
          color: 'default' as const,
        };
      default:
        return {
          label: label || '알수없음',
          color: 'default' as const,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 500,
        fontSize: '0.75rem',
      }}
    />
  );
};