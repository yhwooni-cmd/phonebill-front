import { userApiClient } from './apiClient';
import { LoginRequest, LoginResponse, LoginResponseNormalized, RefreshTokenRequest, RefreshTokenResponse } from '../types/auth';
import { ApiResponse } from '../types/common';

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponseNormalized> {
    const response = await userApiClient.post<LoginResponse>('/auth/login', data);
    
    // API 응답이 직접적으로 토큰 정보를 포함하고 있으므로 response.data를 직접 사용
    const loginData = response.data;
    
    if (!loginData.access_token || !loginData.user_id) {
      throw new Error('로그인 응답에 필요한 정보가 없습니다.');
    }
    
    // snake_case를 camelCase로 변환하여 정규화
    const normalizedResponse: LoginResponseNormalized = {
      accessToken: loginData.access_token,
      refreshToken: loginData.refresh_token,
      tokenType: loginData.token_type,
      expiresIn: loginData.expires_in,
      userId: loginData.user_id,
      customerId: loginData.customer_id,
      lineNumber: loginData.line_number,
      user: {
        userId: loginData.user_id,
        userName: '', // API 응답에 없으므로 빈 값으로 설정
        phoneNumber: loginData.line_number,
        customerId: loginData.customer_id,
        lineNumber: loginData.line_number,
        permissions: [] // API 응답에 없으므로 빈 배열로 설정
      }
    };
    
    return normalizedResponse;
  }

  static async logout(): Promise<void> {
    try {
      await userApiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, proceeding with client-side logout');
    }
  }

  static async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await userApiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || '토큰 갱신에 실패했습니다.');
  }

  static async getUserInfo(userId: string): Promise<any> {
    const response = await userApiClient.get(`/users/${userId}`);
    
    // API 응답이 직접 사용자 정보를 포함하고 있으므로 response.data를 직접 사용
    if (response.data) {
      return response.data;
    }
    
    throw new Error('사용자 정보 조회에 실패했습니다.');
  }
}