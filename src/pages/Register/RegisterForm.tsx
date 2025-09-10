import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { userApiClient, kosMockApiClient } from '../../services/apiClient';

interface RegisterFormData {
  userId: string;
  userName: string;
  lineNumber: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    userId: '',
    userName: '',
    lineNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // 20자 랜덤 customerId 생성 (중복 방지를 위해 타임스탬프 포함)
  const generateCustomerId = (): string => {
    // 현재 시간의 마지막 6자리 + 14자 랜덤 문자 = 20자
    const timestamp = Date.now().toString().slice(-6);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    for (let i = 0; i < 14; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return timestamp + randomPart;
  };

  // 전화번호 형식 변환 (010-1234-5678)
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    if (field === 'lineNumber') {
      value = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // API 에러 제거
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    // 필수 필드 검증
    if (!formData.userId.trim()) {
      newErrors.userId = '사용자ID를 입력해주세요';
    }
    if (!formData.userName.trim()) {
      newErrors.userName = '사용자명을 입력해주세요';
    }
    if (!formData.lineNumber.trim()) {
      newErrors.lineNumber = '전화번호를 입력해주세요';
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.lineNumber)) {
      newErrors.lineNumber = '올바른 전화번호 형식이 아닙니다 (010-1234-5678)';
    }
    if (!formData.password.trim()) {
      newErrors.password = '암호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '암호는 6자 이상이어야 합니다';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '암호확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '암호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const requestData = {
        userId: formData.userId,
        customerId: generateCustomerId(),
        lineNumber: formData.lineNumber,
        userName: formData.userName,
        password: formData.password,
        permissions: ["BILL_INQUIRY", "PRODUCT_CHANGE"]
      };

      await userApiClient.post('/auth/register', requestData);

      // 회원가입 성공 후 mock data API 호출
      try {
        const mockDataRequest = {
          customerId: requestData.customerId,
          lineNumber: formData.lineNumber.replace(/-/g, '') // 대시 제거
        };

        await kosMockApiClient.post('/kos/mock-datas', mockDataRequest);

        console.log('Mock data 생성 완료:', mockDataRequest);
      } catch (mockError: any) {
        console.warn('Mock data 생성 실패:', mockError);
        // Mock data 생성 실패는 회원가입 실패로 처리하지 않음
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login', {
        state: { 
          message: '회원가입이 완료되었습니다. 로그인해주세요.',
          userId: formData.userId 
        }
      });

    } catch (error: any) {
      console.error('회원가입 실패:', error);
      
      // fieldErrors가 있는 경우 각 필드별 에러 메시지 설정
      if (error.response?.data?.fieldErrors) {
        const fieldErrors = error.response.data.fieldErrors;
        const newFieldErrors: Partial<RegisterFormData> = {};
        
        // fieldErrors의 각 필드를 폼의 필드명으로 매핑
        Object.keys(fieldErrors).forEach((fieldName) => {
          if (fieldName in formData) {
            newFieldErrors[fieldName as keyof RegisterFormData] = fieldErrors[fieldName];
          }
        });
        
        setErrors(newFieldErrors);
        
        // 일반적인 에러 메시지도 함께 표시
        if (error.response.data.message) {
          setApiError(error.response.data.message);
        }
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 409) {
        setApiError('이미 사용중인 사용자ID입니다');
      } else if (error.response?.status === 400) {
        setApiError('입력한 정보를 다시 확인해주세요');
      } else {
        setApiError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* API 에러 메시지 */}
      {apiError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setApiError('')}
        >
          {apiError}
        </Alert>
      )}

      {/* 사용자ID */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="userId"
        label="사용자ID"
        name="userId"
        autoComplete="username"
        value={formData.userId}
        onChange={handleInputChange('userId')}
        error={!!errors.userId}
        helperText={errors.userId}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      {/* 사용자명 */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="userName"
        label="사용자명"
        name="userName"
        autoComplete="name"
        value={formData.userName}
        onChange={handleInputChange('userName')}
        error={!!errors.userName}
        helperText={errors.userName}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      {/* 전화번호 */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="lineNumber"
        label="전화번호"
        name="lineNumber"
        placeholder="010-1234-5678"
        value={formData.lineNumber}
        onChange={handleInputChange('lineNumber')}
        error={!!errors.lineNumber}
        helperText={errors.lineNumber}
        disabled={loading}
        inputProps={{ maxLength: 13 }}
        sx={{ mb: 2 }}
      />

      {/* 암호 */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="password"
        label="암호"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        value={formData.password}
        onChange={handleInputChange('password')}
        error={!!errors.password}
        helperText={errors.password}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(event) => event.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* 암호확인 */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="confirmPassword"
        label="암호확인"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                onMouseDown={(event) => event.preventDefault()}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* 회원가입 버튼 */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          mt: 1,
          mb: 2,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: 2,
        }}
      >
        {loading ? '가입 중...' : '회원가입'}
      </Button>
    </Box>
  );
};