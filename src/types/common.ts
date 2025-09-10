export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  message?: string;
  timestamp?: string;
}

export interface User {
  userId: string;
  userName: string;
  phoneNumber: string;
  customerId: string;
  lineNumber: string;
  permissions: string[];
}

export interface RuntimeConfig {
  API_GROUP: string;
  USER_HOST: string;
  BILL_HOST: string;
  PRODUCT_HOST: string;
  KOS_MOCK_HOST: string;
}