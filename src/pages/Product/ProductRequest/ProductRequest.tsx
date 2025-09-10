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
  Alert,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Warning,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import { ProductService } from '../../../services/productService';
import { ProductChangeValidationResponse } from '../../../types/product';

interface ProductRequestProps {
  className?: string;
}

interface ValidationStep {
  id: string;
  label: string;
  completed: boolean;
}

const ProductRequest: React.FC<ProductRequestProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // URL에서 전달받은 상품 정보
  const { currentProduct, selectedProduct } = location.state || {};
  
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([
    { id: 'contract', label: '약정 확인', completed: false },
    { id: 'eligibility', label: '자격 검증', completed: false },
    { id: 'pricing', label: '요금 계산', completed: false },
    { id: 'approval', label: '승인 완료', completed: false }
  ]);
  
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [validationResult, setValidationResult] = useState<ProductChangeValidationResponse | null>(null);
  const [changeInProgress, setChangeInProgress] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // 상품 정보가 없으면 이전 페이지로 돌아가기
    if (!currentProduct || !selectedProduct) {
      navigate('/product/selection');
      return;
    }
  }, [currentProduct, selectedProduct, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const startValidation = async () => {
    try {
      setValidationInProgress(true);
      setError(null);
      setActiveStep(0);

      // 각 단계별로 진행 표시
      for (let i = 0; i < validationSteps.length; i++) {
        setActiveStep(i);
        
        // 실제 환경에서는 각 단계별로 API 호출
        // 여기서는 시뮬레이션을 위해 지연 추가
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setValidationSteps(prev => 
          prev.map((step, index) => 
            index === i ? { ...step, completed: true } : step
          )
        );
      }

      // 실제 사전 체크 API 호출 - 로그인한 사용자의 회선번호 사용
      if (!user?.lineNumber) {
        throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      const validationResponse = await ProductService.validateProductChange({
        lineNumber: user.lineNumber.replace(/-/g, ''), // 대시 제거
        currentProductCode: currentProduct.productCode,
        targetProductCode: selectedProduct.productCode
      });

      setValidationResult(validationResponse);
      setValidationCompleted(true);
      setActiveStep(validationSteps.length);

    } catch (err) {
      console.error('사전 체크 실패:', err);
      setError(err instanceof Error ? err.message : '사전 체크 중 오류가 발생했습니다.');
      setValidationCompleted(false);
    } finally {
      setValidationInProgress(false);
    }
  };

  const handleChangeRequest = () => {
    setShowConfirmDialog(true);
  };

  const confirmChangeRequest = async () => {
    try {
      setShowConfirmDialog(false);
      setChangeInProgress(true);
      setError(null);

      // 로그인한 사용자의 회선번호 사용
      if (!user?.lineNumber) {
        throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      const changeResponse = await ProductService.changeProduct({
        lineNumber: user.lineNumber.replace(/-/g, ''), // 대시 제거
        currentProductCode: currentProduct.productCode,
        targetProductCode: selectedProduct.productCode
      });

      // 처리 결과 페이지로 이동
      navigate('/product/result', {
        state: {
          changeResponse,
          currentProduct,
          selectedProduct
        }
      });

    } catch (err) {
      console.error('상품 변경 실패:', err);
      setError(err instanceof Error ? err.message : '상품 변경 중 오류가 발생했습니다.');
    } finally {
      setChangeInProgress(false);
    }
  };

  const calculatePriceDifference = () => {
    if (!currentProduct || !selectedProduct) return 0;
    return selectedProduct.monthlyFee - currentProduct.monthlyFee;
  };

  if (!currentProduct || !selectedProduct) {
    return null;
  }

  const priceDifference = calculatePriceDifference();

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }} className={className}>
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
          상품 변경 요청
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Change Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="semibold">
            변경 내용 확인
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2} my={3}>
            <Box flex={1} textAlign="center">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                현재 상품
              </Typography>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {currentProduct.productName}
              </Typography>
              <Typography variant="body2" color="primary.main">
                월 {currentProduct.monthlyFee.toLocaleString()}원
              </Typography>
            </Box>
            
            <ArrowForward color="primary" />
            
            <Box flex={1} textAlign="center">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                변경할 상품
              </Typography>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {selectedProduct.productName}
              </Typography>
              <Typography variant="body2" color="primary.main">
                월 {selectedProduct.monthlyFee.toLocaleString()}원
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card sx={{ mb: 3, bgcolor: 'warning.50', borderLeft: 4, borderColor: 'warning.main' }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Warning color="warning" />
            <Box>
              <Typography variant="body1" fontWeight="semibold" gutterBottom>
                중요 안내사항
              </Typography>
              <List dense sx={{ py: 0 }}>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary="• 상품 변경은 다음 월 1일부터 적용됩니다" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary="• 현재 약정 기간이 남아있는 경우 위약금이 발생할 수 있습니다" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary="• 기존 부가서비스는 자동으로 해지되며, 필요시 재신청해야 합니다" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary="• 변경 후 14일 이내에 취소 가능하나, 일부 제약이 있을 수 있습니다" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary="• 요금제 변경에 따른 데이터 이월은 불가능합니다" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Validation Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="semibold">
            사전 검증 진행 상황
          </Typography>
          
          {!validationInProgress && !validationCompleted && (
            <Box textAlign="center" py={2}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                검증을 시작하세요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                검증 대기중
              </Typography>
            </Box>
          )}

          {validationInProgress && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body1">
                  {activeStep + 1}/{validationSteps.length} 단계
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {validationSteps[activeStep]?.label} 진행 중...
                </Typography>
              </Box>
              <LinearProgress sx={{ mb: 2 }} />
            </Box>
          )}

          {validationCompleted && validationResult && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body1" color="success.main">
                  4/4 단계
                </Typography>
                <Typography variant="body2" color="success.main">
                  모든 검증이 완료되었습니다
                </Typography>
              </Box>
              
              {validationResult.validationResult === 'SUCCESS' && (
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                  {validationResult.validationDetails.map((detail, index) => (
                    <Chip
                      key={index}
                      icon={<CheckCircle />}
                      label={detail.message}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}

          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {validationSteps.map((step) => (
              <Step key={step.id} completed={step.completed}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationCompleted && validationResult && validationResult.validationResult === 'FAILURE' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            사전 검증에 실패했습니다.
          </Typography>
          {validationResult.failureReason && (
            <Typography variant="body2">
              {validationResult.failureReason}
            </Typography>
          )}
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
          {!validationInProgress && !validationCompleted && (
            <Button
              variant="contained"
              size="large"
              onClick={startValidation}
              sx={{ minHeight: 56 }}
            >
              사전 검증 시작
            </Button>
          )}
          
          {validationInProgress && (
            <Button
              variant="contained"
              size="large"
              disabled
              sx={{ minHeight: 56 }}
              startIcon={<AccessTime />}
            >
              검증 중...
            </Button>
          )}
          
          {validationCompleted && validationResult?.validationResult === 'SUCCESS' && (
            <Button
              variant="contained"
              size="large"
              onClick={handleChangeRequest}
              disabled={changeInProgress}
              sx={{ 
                minHeight: 56,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                }
              }}
            >
              {changeInProgress ? '변경 신청 중...' : '변경 신청하기'}
            </Button>
          )}
          
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGoBack}
              sx={{ minHeight: 56, flex: 1 }}
            >
              취소
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGoBack}
              sx={{ minHeight: 56, flex: 1 }}
            >
              이전 단계
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>상품 변경 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            선택한 상품으로 변경하시겠습니까?
          </DialogContentText>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              변경할 상품: {selectedProduct.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              월 요금: {selectedProduct.monthlyFee.toLocaleString()}원
            </Typography>
            {priceDifference !== 0 && (
              <Typography 
                variant="body2" 
                color={priceDifference > 0 ? 'error.main' : 'success.main'}
              >
                현재 대비: {priceDifference > 0 ? '+' : ''}{priceDifference.toLocaleString()}원
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            취소
          </Button>
          <Button onClick={confirmChangeRequest} variant="contained" autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductRequest;