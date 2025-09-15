import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  Logout, 
  Receipt, 
  PhoneAndroid, 
  Star,
  Smartphone,
  AttachMoney 
} from '@mui/icons-material';
import { RootState } from '../../stores/store';
import { logout, updateUser } from '../../stores/authSlice';
import { AuthService } from '../../services/authService';
import { ProductService } from '../../services/productService';
import { CustomerInfoResponse } from '../../types/product';

interface UserInfo {
  user_id: string;
  customer_id: string;
  line_number: string;
  user_name: string;
  account_status: string;
  permissions: string[];
}

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지 로드 시 사용자 정보와 상품 정보를 가져옴
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 사용자 정보 조회
        const userInfoData = await AuthService.getUserInfo(user.userId);
        setUserInfo(userInfoData);
        
        // Redux 스토어의 사용자 정보 업데이트 (권한 정보 포함)
        if (userInfoData?.permissions) {
          dispatch(updateUser({
            userName: userInfoData.user_name,
            permissions: userInfoData.permissions
          }));
        }
        
        // 상품 정보 조회 (사용자 정보의 line_number 사용, 대시 제거)
        if (userInfoData?.line_number) {
          const lineNumberWithoutDash = userInfoData.line_number.replace(/-/g, '');
          const customerInfoData = await ProductService.getCustomerInfo(lineNumberWithoutDash);
          setCustomerInfo(customerInfoData);
        }
        
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.userId]);

  const handleLogout = async () => {
    try {
      // API 호출
      await AuthService.logout();
    } catch (error) {
      console.warn('로그아웃 API 호출 실패, 클라이언트 측 로그아웃 진행:', error);
    } finally {
      // 클라이언트 측 로그아웃 처리
      dispatch(logout());
      navigate('/login');
    }
  };

  // 권한 기반 메뉴 아이템 생성
  const getMenuItems = () => {
    const permissions = userInfo?.permissions || [];
    const menuItems = [];

    if (permissions.includes('BILL_INQUIRY')) {
      menuItems.push({
        title: '요금 조회',
        icon: <Receipt sx={{ fontSize: 48 }} />,
        path: '/bill/inquiry-menu',
        description: '월별 통신요금과 사용량을 상세하게 확인할 수 있습니다.',
      });
    }

    // 상품 변경 메뉴는 권한 체크 없이 항상 표시
    menuItems.push({
      title: '상품 변경',
      icon: <PhoneAndroid sx={{ fontSize: 48 }} />,
      path: '/product/menu',
      description: '현재 이용 중인 요금제를 다른 상품으로 변경할 수 있습니다.',
    });

    return menuItems;
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
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
          <Toolbar>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                flexGrow: 1, 
                fontSize: '1.125rem', 
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              📱 통신요금 관리
            </Typography>
            <IconButton onClick={handleLogout} sx={{ color: 'text.primary' }} aria-label="로그아웃">
              <Logout />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
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
        <Toolbar>
          <Typography
            variant="h6"
            component="h1"
            sx={{ 
              flexGrow: 1,
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            📱 통신요금 관리
          </Typography>
          
          <IconButton
            onClick={handleLogout}
            sx={{ color: 'text.primary' }}
            aria-label="로그아웃"
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Message & User Info */}
        {userInfo && (
          <Box sx={{ mb: 3, mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              안녕하세요! {userInfo.user_name}님
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              통신요금 관리 서비스에 오신 것을 환영합니다.
            </Typography>
            
            {/* User & Product Info Card - Enhanced Design */}
            <Card 
              sx={{ 
                mb: 2, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 140,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                {/* Phone Number Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Smartphone sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: 1, 
                        fontSize: '0.875rem', 
                        mb: 0.5,
                        color: 'rgba(255, 255, 255, 0.95)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      회선번호
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '1.5rem', 
                        letterSpacing: '0.5px',
                        color: '#ffffff',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      {userInfo.line_number}
                    </Typography>
                  </Box>
                </Box>
                
                {customerInfo?.currentProduct && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Current Product */}
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Star sx={{ fontSize: 18, mr: 0.5, color: '#ffffff' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.95)',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          현재 상품
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '1.125rem', 
                          lineHeight: 1.2,
                          color: '#ffffff',
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {customerInfo.currentProduct.productName}
                      </Typography>
                    </Box>
                    
                    {/* Monthly Fee */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
                        <AttachMoney sx={{ fontSize: 18, mr: 0.5, color: '#ffffff' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.95)',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          월 요금
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '1.25rem',
                          color: '#ffffff',
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {customerInfo.currentProduct.monthlyFee.toLocaleString()}원
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Additional Product Details */}
                {customerInfo?.currentProduct && (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      gap: 3,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          display: 'block',
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        데이터
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.875rem', 
                          mt: 0.5,
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {customerInfo.currentProduct.dataAllowance}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          display: 'block',
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        통화
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.875rem', 
                          mt: 0.5,
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {customerInfo.currentProduct.voiceAllowance}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          display: 'block',
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        문자
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.875rem', 
                          mt: 0.5,
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {customerInfo.currentProduct.smsAllowance}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Service Menu */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          서비스 메뉴
        </Typography>
        
        <Grid container spacing={2}>
          {getMenuItems().map((item) => (
            <Grid item xs={12} key={item.title}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => {
                  console.log('Navigating to:', item.path);
                  navigate(item.path);
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mr: 3 }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Permissions Message */}
        {getMenuItems().length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            현재 이용 가능한 서비스가 없습니다.
          </Alert>
        )}
      </Box>
    </Box>
  );
};