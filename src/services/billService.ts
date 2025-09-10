import { billApiClient, kosMockApiClient } from './apiClient';
import { BillInquiryRequest, BillInquiryResponse, KosAvailableMonthsResponse, BillMenuResponse } from '../types/bill';
import { ApiResponse } from '../types/common';

export class BillService {
  static async getBillMenu(): Promise<BillMenuResponse> {
    const response = await billApiClient.get<ApiResponse<BillMenuResponse>>('/bills/menu');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || '요금조회 메뉴 로딩에 실패하였습니다.');
  }

  static async inquireBill(data: BillInquiryRequest): Promise<BillInquiryResponse> {
    // lineNumber는 대시 유지, inquiryMonth는 대시 제거 (YYYYMM 형식)
    const requestData = {
      ...data,
      lineNumber: data.lineNumber, // 대시 유지: "010-1234-7777" 
      inquiryMonth: data.billingMonth?.replace(/-/g, '') // 대시 제거: "202508"
    };
    
    // billingMonth 필드명 제거 (inquiryMonth로 변경됨)
    const { billingMonth, ...finalRequestData } = requestData;
    
    const response = await billApiClient.post<ApiResponse<BillInquiryResponse>>('/bills/inquiry', finalRequestData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || response.data.error?.message || '요금 조회에 실패했습니다.');
  }

  static async getAvailableMonths(lineNumber: string): Promise<string[]> {
    // 하이픈을 제거한 회선번호로 요청
    const cleanLineNumber = lineNumber.replace(/-/g, '');
    const response = await kosMockApiClient.get<KosAvailableMonthsResponse>(`/kos/bill/available-months/${cleanLineNumber}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.availableMonths;
    }
    
    throw new Error(response.data.resultMessage || '조회 가능한 월 정보를 가져오는데 실패했습니다.');
  }
}