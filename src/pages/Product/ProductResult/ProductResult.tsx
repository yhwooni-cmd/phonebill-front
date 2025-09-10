import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Home,
  Receipt
} from '@mui/icons-material';
import { ProductService } from '../../../services/productService';
import { CustomerInfoResponse } from '../../../types/product';

interface ProductResultProps {
  className?: string;
}

const ProductResult: React.FC<ProductResultProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // 이전 페이지에서 전달받은 데이터
  const { changeResponse, selectedProduct } = location.state || {};
  
  // 실제 변경된 고객정보 상태
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGoToMain = () => {
    navigate('/');
  };

  const handleGoToBillInquiry = () => {
    navigate('/bill');
  };

  // 실제 변경된 고객정보 조회
  const loadCustomerInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.lineNumber) {
        throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      }

      const response = await ProductService.getCustomerInfo(user.lineNumber);
      setCustomerInfo(response);
    } catch (err: any) {
      console.error('고객 정보 조회 실패:', err);
      setError(err instanceof Error ? err.message : '고객 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 성공한 경우에만 고객정보 조회
    if (changeResponse && changeResponse.processStatus === 'COMPLETED' && changeResponse.resultCode === '0000') {
      loadCustomerInfo();
    } else {
      setLoading(false);
    }
  }, [changeResponse, user]);

  // 처리결과가 없으면 메인으로 리다이렉트
  if (!changeResponse) {
    navigate('/');
    return null;
  }

  const isSuccess = changeResponse.processStatus === 'COMPLETED' && changeResponse.resultCode === '0000';
  
  // 처리일시 포맷팅
  const formatProcessedAt = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}-${hours}:${minutes}:${seconds}`;
  };

  // 다음 월 1일 계산
  const getNextMonthFirstDay = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
    return `${year}년 ${month}월 1일`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }} className={className}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          처리 결과
        </Typography>
      </Box>

      {/* Success/Failure Status */}
      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <CardContent sx={{ py: 4 }}>
          {isSuccess ? (
            <>
              <CheckCircle 
                sx={{ 
                  fontSize: 64, 
                  color: 'success.main',
                  mb: 2
                }} 
              />
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                상품 변경이 완료되었습니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                선택하신 상품으로 변경 신청이 성공적으로 처리되었습니다.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                변경된 상품은 다음 월 1일부터 적용됩니다.
              </Typography>
            </>
          ) : (
            <>
              <ErrorIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'error.main',
                  mb: 2
                }} 
              />
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                상품 변경에 실패했습니다
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {changeResponse.resultMessage || '상품 변경 처리 중 오류가 발생했습니다.'}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Change Details - Success Only */}
      {isSuccess && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="semibold" gutterBottom>
              변경 내용
            </Typography>
            
            {loading ? (
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary">
                  변경된 상품 정보를 불러오는 중...
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                변경된 상품 정보를 불러올 수 없습니다. {error}
              </Alert>
            ) : (
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="text.secondary">
                    변경된 상품
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {customerInfo?.currentProduct?.productName || 
                     changeResponse.changedProduct?.productName || 
                     selectedProduct?.productName || '5G 스탠다드 플랜'}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="text.secondary">
                    월 요금
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="primary.main">
                    월 {(customerInfo?.currentProduct?.monthlyFee || 
                        changeResponse.changedProduct?.monthlyFee || 
                        selectedProduct?.monthlyFee || 59000).toLocaleString()}원
                  </Typography>
                </Box>

                {/* 추가 상품 정보 표시 */}
                {customerInfo?.currentProduct && (
                  <>
                    <Divider />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" color="text.secondary">
                        데이터
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {customerInfo.currentProduct.dataAllowance}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" color="text.secondary">
                        음성통화
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {customerInfo.currentProduct.voiceAllowance}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" color="text.secondary">
                        문자
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {customerInfo.currentProduct.smsAllowance}
                      </Typography>
                    </Box>
                  </>
                )}
                
                <Divider />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="text.secondary">
                    적용일
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getNextMonthFirstDay()}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="text.secondary">
                    처리일시
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                    {formatProcessedAt(changeResponse.processedAt)}
                  </Typography>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Failure Details - Failure Only */}
      {!isSuccess && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>처리 결과:</strong> {changeResponse.resultCode}
          </Typography>
          <Typography variant="body2">
            <strong>오류 메시지:</strong> {changeResponse.resultMessage}
          </Typography>
          {changeResponse.processedAt && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>처리 시간:</strong> {formatProcessedAt(changeResponse.processedAt)}
            </Typography>
          )}
        </Alert>
      )}

      {/* Additional Information for Success */}
      {isSuccess && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>안내사항</strong>
          </Typography>
          <Typography variant="body2">
            • 변경된 상품은 다음 월 1일 0시부터 적용됩니다<br/>
            • 변경 후 14일 이내에 취소 신청이 가능합니다<br/>
            • 기존 부가서비스는 자동 해지되니 필요시 재신청해주세요
          </Typography>
        </Alert>
      )}

      {/* Fixed Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 'sm',
          bgcolor: 'white',
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}
      >
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToMain}
            startIcon={<Home />}
            sx={{ 
              minHeight: 56,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }
            }}
          >
            메인으로
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoToBillInquiry}
            startIcon={<Receipt />}
            sx={{ minHeight: 56 }}
          >
            요금 조회
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ProductResult;