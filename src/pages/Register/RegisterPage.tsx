import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { Phone, ArrowBack } from '@mui/icons-material';
import { RegisterForm } from './RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* 상단 뒤로가기 버튼 */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              mb: 3,
            }}
          >
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBack />}
              sx={{
                color: 'text.secondary',
                p: 1,
                minWidth: 'auto',
              }}
            >
              로그인으로 돌아가기
            </Button>
          </Box>

          {/* 브랜드 영역 */}
          <Paper
            elevation={0}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Phone sx={{ fontSize: 30, color: 'white' }} />
          </Paper>

          <Typography
            variant="h5"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            회원가입
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 4,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            새로운 계정을 만들어 서비스를 이용하세요
          </Typography>

          {/* 회원가입 폼 */}
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <RegisterForm />
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