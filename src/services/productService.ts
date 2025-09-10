import { productApiClient } from './apiClient';
import { 
  CustomerInfoResponse, 
  AvailableProductsResponse, 
  ProductChangeValidationRequest,
  ProductChangeValidationResponse,
  ProductChangeRequest,
  ProductChangeResponse
} from '../types/product';
import { ApiResponse } from '../types/common';

export class ProductService {
  static async getCustomerInfo(lineNumber: string): Promise<CustomerInfoResponse> {
    const response = await productApiClient.get<ApiResponse<CustomerInfoResponse>>(`/products/customer?lineNumber=${lineNumber}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || '고객 정보 조회에 실패했습니다.');
  }

  static async getAvailableProducts(currentProductCode?: string): Promise<AvailableProductsResponse> {
    const url = currentProductCode 
      ? `/products/available?currentProductCode=${currentProductCode}`
      : '/products/available';
    
    const response = await productApiClient.get<ApiResponse<AvailableProductsResponse>>(url);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || '변경 가능한 상품 조회에 실패했습니다.');
  }

  static async validateProductChange(data: ProductChangeValidationRequest): Promise<ProductChangeValidationResponse> {
    const response = await productApiClient.post<ApiResponse<ProductChangeValidationResponse>>('/products/change/validation', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || '상품 변경 사전 체크에 실패했습니다.');
  }

  static async changeProduct(data: ProductChangeRequest): Promise<ProductChangeResponse> {
    const response = await productApiClient.post<ApiResponse<ProductChangeResponse>>('/products/change', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || '상품 변경 요청에 실패했습니다.');
  }
}