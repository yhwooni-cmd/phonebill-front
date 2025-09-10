export interface BillMenuResponse {
  customerInfo: {
    customerId: string;
    lineNumber: string;
  };
  availableMonths: string[];
  currentMonth: string;
}

export interface BillInquiryRequest {
  lineNumber: string;
  billingMonth?: string;
}

export interface BillInquiryResponse {
  requestId: string;
  procStatus: string;
  resultCode: string;
  resultMessage: string;
  billInfo: {
    lineNumber: string;
    billingMonth: string;
    productCode: string;
    productName: string;
    monthlyFee: number;
    usageFee: number;
    discountAmount: number;
    totalFee: number;
    dataUsage: string;
    voiceUsage: string;
    smsUsage: string;
    billStatus: string;
    dueDate: string;
  };
  customerInfo: {
    customerName: string;
    customerId: string;
    operatorCode: string;
    lineStatus: string;
  };
}

export interface KosAvailableMonthsResponse {
  success: boolean;
  resultCode: string;
  resultMessage: string;
  data: {
    resultCode: string;
    resultMessage: string;
    lineNumber: string;
    availableMonths: string[];
  };
  timestamp: string;
  traceId: string;
}