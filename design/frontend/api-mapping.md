# API 매핑 설계서

## 1. API 경로 매핑

### 1.1 Runtime Environment 설정
```javascript
// public/runtime-env.js
window.__runtime_config__ = {
  API_GROUP: "/api/v1",
  USER_HOST: "http://localhost:8080",
  BILL_HOST: "http://localhost:8080", 
  PRODUCT_HOST: "http://localhost:8080",
  KOS_MOCK_HOST: "http://localhost:8080"
};
```
API Gateway를 통해서 라우팅 됨.  

### 1.2 서비스별 API 엔드포인트
- **USER_HOST**: 사용자 인증 및 관리 서비스 (user-service)
- **BILL_HOST**: 요금조회 서비스 (bill-service)
- **PRODUCT_HOST**: 상품변경 서비스 (product-service)
- **KOS_MOCK_HOST**: KOS 시스템 Mock 서비스 (kos-mock)

## 2. API와 화면 상세기능 매칭

### 2.1 로그인 화면 (LoginPage)

#### 2.1.1 사용자 로그인
- **화면**: 로그인 화면
- **기능**: 사용자 ID/PW로 로그인 처리
- **백엔드 서비스**: user-service
- **API 경로**: `POST {USER_HOST}/api/v1/auth/login`

**요청 데이터 구조:**
```typescript
interface LoginRequest {
  userId: string;        // 사용자 ID (3-20자, 영문/숫자/_/-)
  password: string;      // 비밀번호 (8자 이상, 대소문자+숫자+특수문자)
  autoLogin?: boolean;   // 자동로그인 옵션
}
```

**응답 데이터 구조:**
```typescript
interface LoginResponse {
  accessToken: string;    // JWT 액세스 토큰
  refreshToken: string;   // 리프레시 토큰
  tokenType: string;      // "Bearer"
  expiresIn: number;      // 토큰 만료시간(초)
  userId: string;         // 사용자 ID
  customerId: string;     // 고객 ID
  lineNumber: string;     // 회선번호
  user: {
    userId: string;
    userName: string;
    phoneNumber: string;
    permissions: string[]; // 권한 목록
  };
}
```

**API 요청/응답 예시:**
```json
// 요청
{
  "userId": "mvno001",
  "password": "securePassword123!",
  "autoLogin": true
}

// 응답 (성공)
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": "mvno001",
  "customerId": "CU202401001",
  "lineNumber": "010-1234-5678",
  "user": {
    "userId": "mvno001",
    "userName": "홍길동",
    "phoneNumber": "010-1234-5678",
    "permissions": ["BILL_INQUIRY", "PRODUCT_CHANGE"]
  }
}
```

### 2.2 메인 화면 (MainPage)

#### 2.2.1 사용자 정보 조회
- **화면**: 메인 화면
- **기능**: 로그인된 사용자 정보 표시
- **백엔드 서비스**: user-service
- **API 경로**: `GET {USER_HOST}/api/v1/users/{userId}`

**요청 데이터 구조:**
- Path Parameter: `userId` (로그인한 사용자 ID)
- Header: `Authorization: Bearer {accessToken}`

**응답 데이터 구조:**
```typescript
interface UserInfoResponse {
  userId: string;
  customerId: string;
  lineNumber: string;
  userName: string;
  status: string;
  accountStatus: string;
  lastLoginAt: string;
  lastPasswordChangedAt: string;
  permissions: string[];
}
```

### 2.3 요금조회 메뉴 화면 (BillInquiryMenuPage)

#### 2.3.1 조회 가능한 월 목록 조회
- **화면**: 요금조회 메뉴
- **기능**: 요금 데이터가 있는 월 목록 조회
- **백엔드 서비스**: kos-mock
- **API 경로**: `GET {KOS_MOCK_HOST}/api/v1/kos/bill/available-months/{lineNumber}`

**요청 데이터 구조:**
- Path Parameter: `lineNumber` (하이픈 제거된 회선번호, 예: "01012345678")

**응답 데이터 구조:**
```typescript
interface KosAvailableMonthsResponse {
  success: boolean;
  resultCode: string;
  resultMessage: string;
  data: {
    resultCode: string;
    resultMessage: string;
    lineNumber: string;
    availableMonths: string[]; // ["202501", "202412", "202411"]
  };
  timestamp: string;
  traceId: string;
}
```

### 2.4 요금조회 결과 화면 (BillInquiryResultPage)

#### 2.4.1 요금 정보 조회
- **화면**: 요금조회 결과
- **기능**: 선택한 월의 요금 정보 조회
- **백엔드 서비스**: bill-service
- **API 경로**: `POST {BILL_HOST}/api/v1/bills/inquiry`

**요청 데이터 구조:**
```typescript
interface BillInquiryRequest {
  lineNumber: string;      // 회선번호 (010-0000-0000 형태)
  billingMonth?: string;   // 청구월 (YYYYMM, 선택사항 - 미입력시 당월)
}
```

**응답 데이터 구조:**
```typescript
interface BillInquiryResponse {
  success: boolean;
  message: string;
  data: {
    inquiryId: string;
    lineNumber: string;
    billingMonth: string;
    customerInfo: {
      customerId: string;
      customerName: string;
      lineStatus: string;
    };
    billInfo: {
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
    processingTime: string;
    cacheHit: boolean;
  };
}
```

**API 요청/응답 예시:**
```json
// 요청
{
  "lineNumber": "010-1234-5678",
  "billingMonth": "202501"
}

// 응답
{
  "success": true,
  "message": "요금조회가 완료되었습니다",
  "data": {
    "inquiryId": "INQ_20250108_001",
    "lineNumber": "010-1234-5678",
    "billingMonth": "202501",
    "customerInfo": {
      "customerId": "CU202401001",
      "customerName": "홍길동",
      "lineStatus": "ACTIVE"
    },
    "billInfo": {
      "productCode": "5G_PREMIUM_001",
      "productName": "5G 프리미엄 플랜",
      "monthlyFee": 89000,
      "usageFee": 15000,
      "discountAmount": 5000,
      "totalFee": 99000,
      "dataUsage": "150GB",
      "voiceUsage": "250분",
      "smsUsage": "50건",
      "billStatus": "CONFIRMED",
      "dueDate": "20250125"
    },
    "processingTime": "2025-01-08T14:30:00",
    "cacheHit": false
  }
}
```

### 2.5 상품변경 메뉴 화면 (ProductChangeMenuPage)

#### 2.5.1 고객 및 현재 상품 정보 조회
- **화면**: 상품변경 메뉴
- **기능**: 고객 정보와 현재 상품 정보 표시
- **백엔드 서비스**: product-service
- **API 경로**: `GET {PRODUCT_HOST}/api/v1/products/customer?lineNumber={lineNumber}`

**요청 데이터 구조:**
- Query Parameter: `lineNumber` (회선번호, 010으로 시작하는 11자리)

**응답 데이터 구조:**
```typescript
interface CustomerInfoResponse {
  success: boolean;
  data: {
    customerId: string;
    lineNumber: string;
    customerName: string;
    currentProduct: {
      productCode: string;
      productName: string;
      monthlyFee: number;
      dataAllowance: string;
      voiceAllowance: string;
      smsAllowance: string;
      operatorCode: string;
      description?: string;
      available: boolean;
    };
    lineStatus: string;
    contractInfo?: {
      contractDate: string;
      termEndDate: string;
      earlyTerminationFee: number;
    };
  };
}
```

### 2.6 상품변경 선택 화면 (ProductChangeSelectionPage)

#### 2.6.1 변경 가능한 상품 목록 조회
- **화면**: 상품변경 선택
- **기능**: 변경 가능한 상품 목록 표시
- **백엔드 서비스**: product-service
- **API 경로**: `GET {PRODUCT_HOST}/api/v1/products/available?currentProductCode={productCode}`

**요청 데이터 구조:**
- Query Parameter: `currentProductCode` (현재 상품코드, 선택사항)

**응답 데이터 구조:**
```typescript
interface AvailableProductsResponse {
  success: boolean;
  data: {
    products: Array<{
      productCode: string;
      productName: string;
      monthlyFee: number;
      dataAllowance: string;
      voiceAllowance: string;
      smsAllowance: string;
      operatorCode: string;
      description?: string;
      available: boolean;
    }>;
    totalCount: number;
  };
}
```

### 2.7 상품변경 요청 화면 (ProductChangeRequestPage)

#### 2.7.1 상품변경 사전체크
- **화면**: 상품변경 요청
- **기능**: 상품변경 가능 여부 사전 검증
- **백엔드 서비스**: product-service
- **API 경로**: `POST {PRODUCT_HOST}/api/v1/products/change/validation`

**요청 데이터 구조:**
```typescript
interface ProductChangeValidationRequest {
  lineNumber: string;         // 회선번호 (010으로 시작하는 11자리)
  currentProductCode: string; // 현재 상품코드
  targetProductCode: string;  // 변경할 상품코드
}
```

**응답 데이터 구조:**
```typescript
interface ProductChangeValidationResponse {
  success: boolean;
  data: {
    validationResult: "SUCCESS" | "FAILURE";
    validationDetails: Array<{
      checkType: "PRODUCT_AVAILABLE" | "OPERATOR_MATCH" | "LINE_STATUS";
      result: "PASS" | "FAIL";
      message: string;
    }>;
    failureReason?: string;
  };
}
```

#### 2.7.2 상품변경 요청
- **화면**: 상품변경 요청
- **기능**: 실제 상품변경 처리 요청
- **백엔드 서비스**: product-service
- **API 경로**: `POST {PRODUCT_HOST}/api/v1/products/change`

**요청 데이터 구조:**
```typescript
interface ProductChangeRequest {
  lineNumber: string;         // 회선번호
  currentProductCode: string; // 현재 상품코드
  targetProductCode: string;  // 변경할 상품코드
}
```

**응답 데이터 구조:**
```typescript
interface ProductChangeResponse {
  success: boolean;
  data: {
    requestId: string;
    processStatus: "COMPLETED" | "FAILED";
    resultCode: string;
    resultMessage: string;
    changedProduct?: {
      productCode: string;
      productName: string;
      monthlyFee: number;
      dataAllowance: string;
      voiceAllowance: string;
      smsAllowance: string;
      operatorCode: string;
      description?: string;
      available: boolean;
    };
    processedAt: string;
  };
}
```

**API 요청/응답 예시:**
```json
// 사전체크 요청
{
  "lineNumber": "01012345678",
  "currentProductCode": "LTE_BASIC_001", 
  "targetProductCode": "5G_PREMIUM_001"
}

// 사전체크 응답 (성공)
{
  "success": true,
  "data": {
    "validationResult": "SUCCESS",
    "validationDetails": [
      {
        "checkType": "PRODUCT_AVAILABLE",
        "result": "PASS",
        "message": "변경 가능한 상품입니다"
      },
      {
        "checkType": "OPERATOR_MATCH", 
        "result": "PASS",
        "message": "동일 사업자 상품입니다"
      },
      {
        "checkType": "LINE_STATUS",
        "result": "PASS", 
        "message": "회선 상태가 정상입니다"
      }
    ]
  }
}

// 실제 변경 요청
{
  "lineNumber": "01012345678",
  "currentProductCode": "LTE_BASIC_001",
  "targetProductCode": "5G_PREMIUM_001"
}

// 변경 응답 (성공)
{
  "success": true,
  "data": {
    "requestId": "REQ_20250108_001",
    "processStatus": "COMPLETED",
    "resultCode": "0000",
    "resultMessage": "상품변경이 성공적으로 완료되었습니다",
    "changedProduct": {
      "productCode": "5G_PREMIUM_001",
      "productName": "5G 프리미엄 플랜",
      "monthlyFee": 89000,
      "dataAllowance": "무제한",
      "voiceAllowance": "무제한",
      "smsAllowance": "기본 무료",
      "operatorCode": "MVNO001"
    },
    "processedAt": "2025-01-08T15:30:00"
  }
}
```

### 2.8 처리결과 화면 (ProcessResultPage)

#### 2.8.1 처리결과 표시
- **화면**: 처리결과
- **기능**: 상품변경 처리 결과 표시
- **데이터 소스**: 이전 API 호출 결과 (상품변경 요청 응답)
- **추가 API**: 없음 (이전 단계에서 받은 데이터 활용)

## 3. API 호출 시퀀스

### 3.1 요금조회 플로우
```
1. 로그인 → POST /api/v1/auth/login
2. 메인 → GET /api/v1/users/{userId}
3. 요금조회 메뉴 → GET /api/v1/kos/bill/available-months/{lineNumber}
4. 요금조회 실행 → POST /api/v1/bills/inquiry
5. 결과 화면 표시
```

### 3.2 상품변경 플로우
```
1. 로그인 → POST /api/v1/auth/login
2. 메인 → GET /api/v1/users/{userId}
3. 상품변경 메뉴 → GET /api/v1/products/customer
4. 상품 선택 → GET /api/v1/products/available
5. 변경 요청 → POST /api/v1/products/change/validation
6. 실제 변경 → POST /api/v1/products/change
7. 결과 화면 표시
```

## 4. 에러 처리

### 4.1 공통 에러 응답 구조
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
    path: string;
  };
}
```

### 4.2 주요 에러 코드
- **AUTH001**: 인증 실패 (잘못된 ID/PW)
- **AUTH002**: 계정 잠금
- **AUTH003**: 토큰 만료
- **PERM001**: 권한 없음
- **BILL001**: 요금조회 실패
- **PROD001**: 상품변경 사전체크 실패
- **PROD002**: 상품변경 처리 실패
- **SYS001**: 시스템 오류

## 5. 보안 고려사항

### 5.1 인증 토큰 관리
- JWT 토큰을 localStorage 또는 sessionStorage에 저장
- 자동로그인 시 localStorage, 일반 로그인 시 sessionStorage 사용
- 토큰 만료 시 자동 리프레시 또는 재로그인 유도

### 5.2 API 호출 보안
- 모든 API 요청에 Authorization Header 포함
- HTTPS 통신 강제
- 민감한 정보는 POST body에 포함하여 전송

### 5.3 데이터 검증
- 클라이언트 측 입력값 검증
- 서버 응답 데이터 타입 검증
- XSS 방지를 위한 출력 데이터 이스케이프