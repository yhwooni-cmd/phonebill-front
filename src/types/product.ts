export interface Product {
  productCode: string;
  productName: string;
  monthlyFee: number;
  dataAllowance: string;
  voiceAllowance: string;
  smsAllowance: string;
  operatorCode: string;
  description?: string;
  available: boolean;
}

export interface CustomerInfoResponse {
  customerId: string;
  lineNumber: string;
  customerName: string;
  currentProduct: Product;
  lineStatus: string;
  contractInfo?: {
    contractDate: string;
    termEndDate: string;
    earlyTerminationFee: number;
  };
}

export interface AvailableProductsResponse {
  products: Product[];
  totalCount: number;
}

export interface ProductChangeValidationRequest {
  lineNumber: string;
  currentProductCode: string;
  targetProductCode: string;
}

export interface ProductChangeValidationResponse {
  validationResult: "SUCCESS" | "FAILURE";
  validationDetails: Array<{
    checkType: "PRODUCT_AVAILABLE" | "OPERATOR_MATCH" | "LINE_STATUS";
    result: "PASS" | "FAIL";
    message: string;
  }>;
  failureReason?: string;
}

export interface ProductChangeRequest {
  lineNumber: string;
  currentProductCode: string;
  targetProductCode: string;
}

export interface ProductChangeResponse {
  requestId: string;
  processStatus: "COMPLETED" | "FAILED";
  resultCode: string;
  resultMessage: string;
  changedProduct?: Product;
  processedAt: string;
}