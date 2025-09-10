# 정보 아키텍처 설계

## 1. 사이트맵

### 1.1 전체 페이지 구조
```
/ (Root - 리디렉션)
├── /login (로그인 화면)
├── /main (메인 화면) [Protected]
├── /bill/ (요금조회 관련) [Protected]
│   ├── /menu (요금조회 메뉴)
│   └── /result (요금조회 결과)
└── /product/ (상품변경 관련) [Protected]
    ├── /menu (상품변경 메뉴)
    ├── /selection (상품 선택)
    ├── /request (변경 요청)
    └── /result (처리 결과)
```

### 1.2 네비게이션 흐름
```
로그인 → 메인 화면
메인 화면 ← → 요금조회 메뉴 → 요금조회 결과
메인 화면 ← → 상품변경 메뉴 → 상품선택 → 변경요청 → 처리결과
```

### 1.3 권한별 접근 제어
- **Public**: `/`, `/login`
- **Authenticated**: `/main`, `/bill/*`, `/product/*`
- **BILL_INQUIRY Permission**: `/bill/*`
- **PRODUCT_CHANGE Permission**: `/product/*`

## 2. 프로젝트 구조 설계

### 2.1 전체 디렉토리 구조
```
phonebill-front/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── runtime-env.js              # API 엔드포인트 설정
├── src/
│   ├── components/                 # 재사용 가능한 컴포넌트
│   │   ├── Layout/                # 레이아웃 컴포넌트
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── Common/                # 공통 컴포넌트
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   └── EmptyState.tsx
│   │   └── UI/                    # UI 기본 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── StatusBadge.tsx
│   ├── pages/                     # 페이지 컴포넌트
│   │   ├── Login/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── index.ts
│   │   ├── Main/
│   │   │   ├── MainPage.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   └── index.ts
│   │   ├── Bill/
│   │   │   ├── BillInquiryMenu/
│   │   │   │   ├── BillInquiryMenuPage.tsx
│   │   │   │   ├── InquiryForm.tsx
│   │   │   │   └── index.ts
│   │   │   └── BillInquiryResult/
│   │   │       ├── BillInquiryResultPage.tsx
│   │   │       ├── BillInfoCard.tsx
│   │   │       ├── UsageTable.tsx
│   │   │       └── index.ts
│   │   └── Product/
│   │       ├── ProductChangeMenu/
│   │       │   ├── ProductChangeMenuPage.tsx
│   │       │   ├── CurrentProductCard.tsx
│   │       │   └── index.ts
│   │       ├── ProductSelection/
│   │       │   ├── ProductSelectionPage.tsx
│   │       │   ├── ProductCard.tsx
│   │       │   └── index.ts
│   │       ├── ProductRequest/
│   │       │   ├── ProductRequestPage.tsx
│   │       │   ├── ChangeConfirmation.tsx
│   │       │   └── index.ts
│   │       └── ProcessResult/
│   │           ├── ProcessResultPage.tsx
│   │           ├── ResultCard.tsx
│   │           └── index.ts
│   ├── hooks/                     # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePermissions.ts
│   ├── services/                  # API 서비스
│   │   ├── api.ts                 # API 클라이언트 설정
│   │   ├── auth.ts                # 인증 관련 API
│   │   ├── bill.ts                # 요금조회 관련 API
│   │   ├── product.ts             # 상품변경 관련 API
│   │   └── user.ts                # 사용자 관련 API
│   ├── stores/                    # 상태 관리
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   └── appStore.ts
│   ├── utils/                     # 유틸리티 함수
│   │   ├── format.ts              # 포맷팅 함수
│   │   ├── validation.ts          # 유효성 검사
│   │   ├── storage.ts             # 스토리지 관리
│   │   └── constants.ts           # 상수
│   ├── types/                     # TypeScript 타입 정의
│   │   ├── auth.ts
│   │   ├── bill.ts
│   │   ├── product.ts
│   │   ├── user.ts
│   │   └── common.ts
│   ├── styles/                    # 스타일 관련
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── antd-theme.ts          # Ant Design 테마
│   ├── assets/                    # 정적 자산
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── config/                    # 설정 파일
│   │   ├── env.ts
│   │   └── router.tsx
│   ├── App.tsx                    # 메인 앱 컴포넌트
│   ├── main.tsx                   # 엔트리 포인트
│   └── vite-env.d.ts              # Vite 타입 정의
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js (선택사항)
└── README.md
```

### 2.2 컴포넌트 구조 원칙

#### 2.2.1 페이지 컴포넌트 구조
```typescript
// pages/[Feature]/[PageName]/
├── [PageName]Page.tsx     # 메인 페이지 컴포넌트
├── Component1.tsx         # 페이지 전용 컴포넌트
├── Component2.tsx         # 페이지 전용 컴포넌트  
├── hooks.ts              # 페이지 전용 훅 (선택사항)
├── types.ts              # 페이지 전용 타입 (선택사항)
└── index.ts              # Export 파일
```

#### 2.2.2 공통 컴포넌트 구조
```typescript
// components/[Category]/[ComponentName].tsx
// 또는
// components/[Category]/[ComponentName]/
├── [ComponentName].tsx
├── [ComponentName].module.css (선택사항)
├── types.ts (선택사항)
└── index.ts
```

### 2.3 라우팅 구조

#### 2.3.1 라우터 설정
```typescript
// config/router.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/main" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      {
        path: "main",
        element: <MainPage />
      },
      {
        path: "bill",
        children: [
          {
            path: "menu",
            element: <RequirePermission permission="BILL_INQUIRY"><BillInquiryMenuPage /></RequirePermission>
          },
          {
            path: "result",
            element: <RequirePermission permission="BILL_INQUIRY"><BillInquiryResultPage /></RequirePermission>
          }
        ]
      },
      {
        path: "product",
        children: [
          {
            path: "menu",
            element: <RequirePermission permission="PRODUCT_CHANGE"><ProductChangeMenuPage /></RequirePermission>
          },
          {
            path: "selection",
            element: <RequirePermission permission="PRODUCT_CHANGE"><ProductSelectionPage /></RequirePermission>
          },
          {
            path: "request", 
            element: <RequirePermission permission="PRODUCT_CHANGE"><ProductRequestPage /></RequirePermission>
          },
          {
            path: "result",
            element: <RequirePermission permission="PRODUCT_CHANGE"><ProcessResultPage /></RequirePermission>
          }
        ]
      }
    ]
  }
]);
```

### 2.4 상태 관리 구조

#### 2.4.1 전역 상태 (Zustand 사용)
```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

// stores/appStore.ts  
interface AppStore {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

#### 2.4.2 로컬 상태 (React useState/useReducer)
- 폼 데이터
- UI 상태 (모달 열림/닫힘 등)
- 임시 데이터

### 2.5 API 서비스 구조

#### 2.5.1 API 클라이언트 설정
```typescript
// services/api.ts
class ApiClient {
  private baseURL: string;
  private token: string | null;
  
  constructor() {
    this.baseURL = window.__runtime_config__?.API_GROUP || '/api/v1';
    this.token = localStorage.getItem('token');
  }
  
  // HTTP 메서드들...
}
```

#### 2.5.2 서비스별 API
```typescript
// services/auth.ts
export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> { }
  static async logout(): Promise<void> { }
  static async refreshToken(token: string): Promise<RefreshTokenResponse> { }
}

// services/bill.ts  
export class BillService {
  static async inquireBill(data: BillInquiryRequest): Promise<BillInquiryResponse> { }
  static async getAvailableMonths(lineNumber: string): Promise<string[]> { }
}
```

### 2.6 타입 정의 구조

#### 2.6.1 API 응답 타입
```typescript
// types/common.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// types/auth.ts
export interface LoginRequest {
  userId: string;
  password: string;
  autoLogin?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}
```

### 2.7 환경 설정 구조

#### 2.7.1 런타임 환경 설정
```javascript
// public/runtime-env.js
window.__runtime_config__ = {
  API_GROUP: "/api/v1",
  USER_HOST: "http://localhost:8081",
  BILL_HOST: "http://localhost:8082",
  PRODUCT_HOST: "http://localhost:8083", 
  KOS_MOCK_HOST: "http://localhost:8084"
};
```

#### 2.7.2 환경별 설정
```typescript
// config/env.ts
export const config = {
  apiUrl: window.__runtime_config__?.API_GROUP || '/api/v1',
  hosts: {
    user: window.__runtime_config__?.USER_HOST || 'http://localhost:8081',
    bill: window.__runtime_config__?.BILL_HOST || 'http://localhost:8082',
    product: window.__runtime_config__?.PRODUCT_HOST || 'http://localhost:8083',
    kosMock: window.__runtime_config__?.KOS_MOCK_HOST || 'http://localhost:8084'
  }
};
```

## 3. 데이터 흐름 아키텍처

### 3.1 컴포넌트 간 데이터 흐름
```
App
├── AuthStore (전역 인증 상태)
├── AppStore (전역 앱 상태)
└── Pages
    ├── Local State (useState)
    ├── API Calls (services)
    └── Custom Hooks (로직 분리)
```

### 3.2 API 호출 패턴
```typescript
// 1. Service Layer에서 API 호출
// 2. Custom Hook에서 상태 관리
// 3. Component에서 Hook 사용

// 예시: useBillInquiry Hook
const useBillInquiry = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const inquire = async (request: BillInquiryRequest) => {
    try {
      setLoading(true);
      const response = await BillService.inquireBill(request);
      setData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, inquire };
};
```

## 4. 성능 최적화 전략

### 4.1 코드 스플리팅
```typescript
// 페이지별 lazy loading
const LoginPage = lazy(() => import('./pages/Login'));
const MainPage = lazy(() => import('./pages/Main'));
const BillInquiryMenuPage = lazy(() => import('./pages/Bill/BillInquiryMenu'));
```

### 4.2 컴포넌트 최적화
- React.memo() 적용
- useMemo/useCallback 활용
- 불필요한 리렌더링 방지

### 4.3 번들 최적화
- Tree shaking 활용
- 중복 의존성 제거
- 동적 import 사용