import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/env';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 인증 토큰 자동 추가
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 개발 환경에서 요청 로깅
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('API Response:', {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // 토큰 만료 처리 (401 Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
            if (refreshToken) {
              // 토큰 갱신 로직 (추후 구현)
              console.log('Token refresh needed');
            }
          } catch (refreshError) {
            // 토큰 갱신 실패 시 로그아웃 처리
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // 에러 로깅
        console.error('API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });

        return Promise.reject(error);
      }
    );
  }

  private clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

// 서비스별 API 클라이언트 인스턴스
export const userApiClient = new ApiClient(config.hosts.user + config.apiGroup);
export const billApiClient = new ApiClient(config.hosts.bill + config.apiGroup);
export const productApiClient = new ApiClient(config.hosts.product + config.apiGroup);
export const kosMockApiClient = new ApiClient(config.hosts.kosMock + config.apiGroup);