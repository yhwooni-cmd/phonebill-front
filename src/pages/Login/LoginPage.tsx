import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { RootState } from '../../stores/store';
import { LoginForm } from './LoginForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 이미 인증된 사용자는 메인으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/main';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLoginSuccess = () => {
    const from = location.state?.from?.pathname || '/main';
    navigate(from, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          {/* 브랜드 영역 */}
          <Paper
            elevation={0}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Phone sx={{ fontSize: 40, color: 'white' }} />
          </Paper>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            통신요금 관리
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 6,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            간편하고 안전한 요금 관리 서비스
          </Typography>

          {/* 로그인 폼 */}
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </Box>

          {/* 회원가입 링크 */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              계정이 없으신가요?
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              sx={{
                fontWeight: 500,
                borderRadius: 2,
                px: 4,
              }}
            >
              회원가입
            </Button>
          </Box>

          {/* 푸터 */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 6,
              textAlign: 'center',
              fontSize: '0.75rem',
            }}
          >
            © 2025 통신요금 관리 서비스. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};