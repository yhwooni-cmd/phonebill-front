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
  Radio,
  FormControlLabel,
  RadioGroup,
  Chip,
  Skeleton,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material';
import { ProductService } from '../../../services/productService';
import { Product, CustomerInfoResponse } from '../../../types/product';

interface ProductSelectionProps {
  className?: string;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({ className }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 현재 상품 정보 조회 - 로그인한 사용자의 회선번호 사용
      if (!user?.lineNumber) {
        throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      const customerInfo: CustomerInfoResponse = await ProductService.getCustomerInfo(user.lineNumber);
      setCurrentProduct(customerInfo.currentProduct);

      // 변경 가능한 상품 목록 조회
      const availableProductsResponse = await ProductService.getAvailableProducts(customerInfo.currentProduct.productCode);
      setAvailableProducts(availableProductsResponse.products);

    } catch (err) {
      console.error('상품 정보 조회 실패:', err);
      setError(err instanceof Error ? err.message : '상품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleProductSelect = (productCode: string) => {
    setSelectedProductCode(productCode);
  };

  const handleNextStep = () => {
    if (!selectedProductCode) {
      setError('변경할 상품을 선택해주세요.');
      return;
    }

    const selectedProduct = availableProducts.find(p => p.productCode === selectedProductCode);
    if (selectedProduct && currentProduct) {
      // 선택한 상품 정보와 현재 상품 정보를 state로 전달하여 다음 페이지로 이동
      navigate('/product/request', {
        state: {
          currentProduct,
          selectedProduct
        }
      });
    }
  };

  const calculatePriceDifference = (newPrice: number, currentPrice: number) => {
    return newPrice - currentPrice;
  };

  const formatPriceDifference = (difference: number) => {
    if (difference > 0) {
      return {
        text: `월 ${difference.toLocaleString()}원 추가`,
        color: 'error.main',
        icon: <TrendingUp sx={{ fontSize: 16 }} />
      };
    } else if (difference < 0) {
      return {
        text: `월 ${Math.abs(difference).toLocaleString()}원 절약`,
        color: 'success.main',
        icon: <TrendingDown sx={{ fontSize: 16 }} />
      };
    } else {
      return {
        text: '동일한 요금',
        color: 'text.secondary',
        icon: <Remove sx={{ fontSize: 16 }} />
      };
    }
  };

  const formatAllowance = (allowance: string) => {
    if (allowance === '-1분' || allowance === '-1건') return '무제한';
    if (allowance === '0건') return '기본 무료';
    return allowance;
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }} className={className}>
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
            상품 선택
          </Typography>
        </Box>

        {/* Current Product Skeleton */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={200} height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={100} height={20} />
          </CardContent>
        </Card>

        {/* Product List Skeletons */}
        <Typography variant="h6" gutterBottom fontWeight="semibold">
          변경 가능한 상품
        </Typography>
        {[1, 2, 3].map((index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="rectangular" height={120} />
            </CardContent>
          </Card>
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }} className={className}>
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
            상품 선택
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={loadProductData}>
          다시 시도
        </Button>
      </Container>
    );
  }

  const selectedProduct = availableProducts.find(p => p.productCode === selectedProductCode);

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
          상품 선택
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Current Product Summary */}
      {currentProduct && (
        <Card sx={{ mb: 3, bgcolor: 'grey.100' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
              현재 이용 중인 상품
            </Typography>
            <Typography variant="h6" fontWeight="semibold" gutterBottom>
              {currentProduct.productName}
            </Typography>
            <Typography variant="body1" color="primary.main" fontWeight="medium">
              월 {currentProduct.monthlyFee.toLocaleString()}원
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Products Section */}
      <Typography variant="h6" gutterBottom fontWeight="semibold" sx={{ mb: 2 }}>
        변경 가능한 상품
      </Typography>

      <RadioGroup
        value={selectedProductCode}
        onChange={(e) => handleProductSelect(e.target.value)}
      >
        <Stack spacing={2}>
          {availableProducts.map((product) => {
            const priceDifference = currentProduct 
              ? calculatePriceDifference(product.monthlyFee, currentProduct.monthlyFee)
              : 0;
            const priceInfo = formatPriceDifference(priceDifference);

            return (
              <Card
                key={product.productCode}
                sx={{
                  border: 2,
                  borderColor: selectedProductCode === product.productCode ? 'primary.main' : 'grey.200',
                  bgcolor: selectedProductCode === product.productCode ? 'primary.50' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.300',
                    boxShadow: 1
                  }
                }}
                onClick={() => handleProductSelect(product.productCode)}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        color: 'white',
                        flexShrink: 0
                      }}
                    >
                      📱
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" fontWeight="semibold">
                          {product.productName}
                        </Typography>
                        <FormControlLabel
                          value={product.productCode}
                          control={<Radio />}
                          label=""
                          sx={{ m: 0 }}
                        />
                      </Box>

                      <Typography variant="h6" color="primary.main" fontWeight="medium" gutterBottom>
                        월 {product.monthlyFee.toLocaleString()}원
                      </Typography>

                      {/* Benefits */}
                      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                          label={`5G 데이터 ${formatAllowance(product.dataAllowance)}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                          label={`음성통화 ${formatAllowance(product.voiceAllowance)}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                          label={`문자 ${formatAllowance(product.smsAllowance)}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>

                      {/* Price Comparison */}
                      {currentProduct && (
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={1} 
                          pt={1.5} 
                          borderTop={1} 
                          borderColor="divider"
                        >
                          <Typography variant="body2" color="text.secondary">
                            현재 상품 대비
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {priceInfo.icon}
                            <Typography 
                              variant="body2" 
                              color={priceInfo.color}
                              fontWeight="semibold"
                            >
                              {priceInfo.text}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </RadioGroup>

      {/* No Products Message */}
      {availableProducts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          현재 변경 가능한 상품이 없습니다.
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
            onClick={handleNextStep}
            disabled={!selectedProductCode}
            sx={{ 
              minHeight: 56,
              background: selectedProductCode 
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                : undefined,
              '&:hover': selectedProductCode ? {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              } : undefined
            }}
          >
            {selectedProduct 
              ? `${selectedProduct.productName}으로 변경`
              : '선택한 상품으로 변경'
            }
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoBack}
            sx={{ minHeight: 56 }}
          >
            취소
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ProductSelection;