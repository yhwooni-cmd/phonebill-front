import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { restoreAuth } from '../stores/authSlice';
import { User } from '../types/common';

export const useAuthRestore = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const restoreUserSession = () => {
      try {
        // localStorage 또는 sessionStorage에서 토큰과 사용자 정보 복원
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (token && refreshToken && userStr) {
          const user: User = JSON.parse(userStr);
          
          // 토큰이 만료되었는지 간단히 체크 (실제로는 JWT 디코딩 필요)
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp && tokenPayload.exp > currentTime) {
            dispatch(restoreAuth({ token, refreshToken, user }));
          } else {
            // 토큰이 만료된 경우 스토리지 정리
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
        // 복원 실패 시 스토리지 정리
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
      }
    };

    restoreUserSession();
  }, [dispatch]);
};