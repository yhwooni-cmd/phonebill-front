import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { loginStart, loginSuccess, loginFailure } from '../../stores/authSlice';
import { AuthService } from '../../services/authService';
import { LoginRequest } from '../../types/auth';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginRequest>({
    userId: '',
    password: '',
    autoLogin: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 회원가입 완료 후 메시지 표시
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // 회원가입에서 넘어온 사용자ID로 폼 초기화
      if (location.state.userId) {
        setFormData(prev => ({ ...prev, userId: location.state.userId }));
      }
    }
  }, [location.state]);

  const handleInputChange = (field: keyof LoginRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // 입력 시 에러/성공 메시지 클리어
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.userId.trim()) {
      setError('아이디를 입력해주세요.');
      return false;
    }
    
    if (formData.userId.length < 3 || formData.userId.length > 20) {
      setError('아이디는 3~20자로 입력해주세요.');
      return false;
    }

    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    dispatch(loginStart());

    try {
      const response = await AuthService.login(formData);
      dispatch(loginSuccess(response));
      
      onLoginSuccess();
    } catch (err: any) {
      const errorMessage = err.message || '로그인에 실패했습니다.';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        maxWidth: 400, 
        mx: 'auto',
        backgroundColor: 'transparent',
      }}
    >
      <CardContent sx={{ px: 0 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              아이디
            </Typography>
            <TextField
              fullWidth
              value={formData.userId}
              onChange={handleInputChange('userId')}
              placeholder="아이디를 입력하세요"
              disabled={loading}
              inputProps={{
                'aria-label': '사용자 아이디',
                maxLength: 20,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              비밀번호
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="비밀번호 보기 토글"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                'aria-label': '비밀번호',
                maxLength: 50,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.autoLogin}
                  onChange={handleInputChange('autoLogin')}
                  disabled={loading}
                  color="primary"
                />
              }
              label="자동 로그인"
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                  color: 'text.primary',
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !formData.userId || !formData.password}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};