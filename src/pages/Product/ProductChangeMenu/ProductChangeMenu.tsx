import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Button, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack, 
  CheckCircle, 
  Warning,
  Phone,
  Person
} from '@mui/icons-material';
import { ProductService } from '../../../services/productService';
import { CustomerInfoResponse } from '../../../types/product';

interface ProductChangeMenuProps {
  className?: string;
}

const ProductChangeMenu: React.FC<ProductChangeMenuProps> = ({ className }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomerInfo();
  }, []);

  const loadCustomerInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 로그인한 사용자의 회선번호 사용
      if (!user?.lineNumber) {
        throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      const response = await ProductService.getCustomerInfo(user.lineNumber);
      setCustomerInfo(response);
    } catch (err) {
      console.error('고객 정보 조회 실패:', err);
      setError(err instanceof Error ? err.message : '고객 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleProductChange = () => {
    navigate('/product/selection');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{ mr: 2 }}
            color="inherit"
          >
            뒤로가기
          </Button>
          <Typography variant="h5" component="h1" fontWeight="bold">
            상품 변경
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography>고객 정보를 불러오고 있습니다...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{ mr: 2 }}
            color="inherit"
          >
            뒤로가기
          </Button>
          <Typography variant="h5" component="h1" fontWeight="bold">
            상품 변경
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={loadCustomerInfo}>
          다시 시도
        </Button>
      </Container>
    );
  }

  if (!customerInfo) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Alert severity="error">
          고객 정보를 찾을 수 없습니다.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }} className={className}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
          color="inherit"
        >
          뒤로가기
        </Button>
        <Typography variant="h5" component="h1" fontWeight="bold">
          상품 변경
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Customer Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="semibold">
            고객 정보
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
            <Box display="flex" alignItems="center">
              <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: '1.25rem' }} />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                회선번호
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="semibold">
              {customerInfo.lineNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
            <Box display="flex" alignItems="center">
              <Person sx={{ mr: 1, color: 'text.secondary', fontSize: '1.25rem' }} />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                고객명
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="semibold">
              {user?.userName || customerInfo.customerName}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Current Product Info */}
      <Card 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '2px solid #90caf9'
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}
            >
              📱
            </Box>
            <Typography variant="h6" component="h3" fontWeight="bold" color="primary.dark">
              {customerInfo.currentProduct.productName}
            </Typography>
          </Box>
          
          <Typography variant="h6" color="primary.dark" fontWeight="semibold" mb={2}>
            월 {customerInfo.currentProduct.monthlyFee.toLocaleString()}원
          </Typography>
          
          <List dense disablePadding>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary={`5G 데이터 ${customerInfo.currentProduct.dataAllowance}`}
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: 'text.primary'
                  }
                }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary={`음성통화 ${customerInfo.currentProduct.voiceAllowance}`}
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: 'text.primary'
                  }
                }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary={`문자 ${customerInfo.currentProduct.smsAllowance}`}
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: 'text.primary'
                  }
                }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="해외 로밍 50% 할인"
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: 'text.primary'
                  }
                }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Notice */}
      <Alert 
        severity="warning" 
        icon={<Warning />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle2" fontWeight="semibold" gutterBottom>
          상품 변경 시 주의사항
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
          <li>상품 변경은 다음 월 1일부터 적용됩니다</li>
          <li>기존 약정 조건에 따라 위약금이 발생할 수 있습니다</li>
          <li>변경 후에는 이전 상품으로 즉시 되돌릴 수 없습니다</li>
          <li>부가서비스는 별도로 재신청이 필요할 수 있습니다</li>
        </Box>
      </Alert>

      {/* Action Buttons */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          variant="contained"
          size="large"
          onClick={handleProductChange}
          sx={{ 
            minHeight: 56,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
            }
          }}
        >
          상품 변경하기
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={handleGoBack}
          sx={{ minHeight: 56 }}
        >
          취소
        </Button>
      </Box>
    </Container>
  );
};

export default ProductChangeMenu;