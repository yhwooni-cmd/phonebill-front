# UI/UX 설계서

## 1. UI 프레임워크 선택

### 1.1 선택된 프레임워크: Ant Design
- **이유**: 
  - 비즈니스 애플리케이션에 특화된 컴포넌트 제공
  - TypeScript 완전 지원
  - 한국에서 널리 사용되는 검증된 프레임워크
  - 통신요금 관리 서비스에 필요한 Form, Table, Modal 등 풍부한 컴포넌트
  - 일관된 디자인 시스템과 접근성 기본 지원

## 2. 화면 목록 정의

### 2.1 전체 화면 구성
1. **LoginPage** - 로그인 화면
2. **MainPage** - 메인 화면 (서비스 선택)
3. **BillInquiryMenuPage** - 요금조회 메뉴
4. **BillInquiryResultPage** - 요금조회 결과
5. **ProductChangeMenuPage** - 상품변경 메뉴
6. **ProductChangeSelectionPage** - 상품변경 선택
7. **ProductChangeRequestPage** - 상품변경 요청
8. **ProcessResultPage** - 처리결과

## 3. 화면 간 사용자 플로우 정의

### 3.1 전체 플로우
```
Login → Main → (요금조회 또는 상품변경 플로우)
```

### 3.2 요금조회 플로우
```
Main → BillInquiryMenu → BillInquiryResult
```

### 3.3 상품변경 플로우
```
Main → ProductChangeMenu → ProductChangeSelection → ProductChangeRequest → ProcessResult
```

### 3.4 네비게이션 규칙
- 각 화면에 Back 버튼과 화면 타이틀 표시 (요구사항)
- 하단 네비게이션 바 없음 (요구사항)
- React Router를 통한 SPA 네비게이션
- 인증이 필요한 페이지는 Protected Routes 적용

## 4. 화면별 상세 설계

### 4.1 LoginPage (로그인 화면)
#### 4.1.1 상세기능
- 사용자 ID/Password 입력
- 자동로그인 옵션 제공
- 로그인 처리 및 토큰 관리
- 인증 실패 시 에러 메시지 표시
- 계정 잠금 상태 확인

#### 4.1.2 UI 구성요소
- `Form`: 전체 로그인 폼
- `Input`: 사용자 ID 입력
- `Input.Password`: 비밀번호 입력
- `Checkbox`: 자동로그인 옵션
- `Button`: 로그인 버튼
- `Alert`: 에러 메시지 표시

#### 4.1.3 인터랙션
- ID/Password 입력 validation
- 로그인 API 호출
- JWT 토큰 저장 (localStorage/sessionStorage)
- 인증 성공 시 메인 페이지로 이동
- 에러 처리 및 사용자 피드백

### 4.2 MainPage (메인 화면)
#### 4.2.1 상세기능
- 사용자 정보 표시
- 이용 가능한 서비스 메뉴 표시
- 권한별 메뉴 활성화/비활성화
- 로그아웃 기능

#### 4.2.2 UI 구성요소
- `Layout.Header`: 사용자 정보와 로그아웃
- `Card`: 요금조회 서비스 카드
- `Card`: 상품변경 서비스 카드
- `Button`: 각 서비스 이동 버튼

#### 4.2.3 인터랙션
- 사용자 권한 확인 API 호출
- 서비스별 접근 권한 체크
- 메뉴 클릭 시 해당 서비스 페이지로 이동

### 4.3 BillInquiryMenuPage (요금조회 메뉴)
#### 4.3.1 상세기능
- 회선번호 표시
- 조회월 선택 (선택사항, 미선택 시 당월)
- 요금조회 요청 처리

#### 4.3.2 UI 구성요소
- `PageHeader`: Back 버튼과 "요금조회" 타이틀
- `Descriptions`: 회선번호 정보
- `DatePicker`: 조회월 선택 (YYYY-MM 형태)
- `Button`: 조회하기 버튼

#### 4.3.3 인터랙션
- 조회 가능한 월 목록 API 호출
- 조회월 선택 (옵셔널)
- 요금조회 API 호출 및 결과 페이지로 이동

### 4.4 BillInquiryResultPage (요금조회 결과)
#### 4.4.1 상세기능
- 요금 상세 정보 표시
- 상품정보, 사용량, 요금 등 표시
- 할인 정보 및 납부 정보 표시

#### 4.4.2 UI 구성요소
- `PageHeader`: Back 버튼과 "요금조회 결과" 타이틀
- `Card`: 기본 정보 (청구월, 상품명 등)
- `Descriptions`: 요금 상세 내역
- `Table`: 사용량 및 할인 정보

#### 4.4.3 인터랙션
- 조회 결과 데이터 표시
- 뒤로가기 기능

### 4.5 ProductChangeMenuPage (상품변경 메뉴)
#### 4.5.1 상세기능
- 현재 상품 정보 표시
- 고객 정보 확인
- 상품변경 화면으로 이동

#### 4.5.2 UI 구성요소
- `PageHeader`: Back 버튼과 "상품변경" 타이틀
- `Card`: 현재 상품 정보
- `Descriptions`: 고객 정보
- `Button`: 상품변경하기 버튼

#### 4.5.3 인터랙션
- 고객 정보 및 현재 상품 정보 조회 API 호출
- 상품변경 권한 확인

### 4.6 ProductChangeSelectionPage (상품변경 선택)
#### 4.6.1 상세기능
- 변경 가능한 상품 목록 표시
- 상품 비교 정보 제공
- 상품 선택 기능

#### 4.6.2 UI 구성요소
- `PageHeader`: Back 버튼과 "상품선택" 타이틀
- `Radio.Group`: 상품 선택 라디오 그룹
- `Card`: 각 상품별 상세 정보 카드
- `Button`: 다음 단계 버튼

#### 4.6.3 인터랙션
- 변경 가능한 상품 목록 API 호출
- 상품 선택 validation
- 선택한 상품으로 변경요청 페이지 이동

### 4.7 ProductChangeRequestPage (상품변경 요청)
#### 4.7.1 상세기능
- 변경 전후 상품 정보 비교 표시
- 변경 조건 및 주의사항 안내
- 최종 변경 요청 처리

#### 4.7.2 UI 구성요소
- `PageHeader`: Back 버튼과 "상품변경 요청" 타이틀
- `Descriptions`: 변경 전후 상품 비교
- `Alert`: 주의사항 안내
- `Button`: 변경요청 버튼

#### 4.7.3 인터랙션
- 상품변경 사전체크 API 호출
- 사전체크 통과 시 실제 변경요청 API 호출
- 처리 결과에 따라 결과 페이지로 이동

### 4.8 ProcessResultPage (처리결과)
#### 4.8.1 상세기능
- 상품변경 처리 결과 표시
- 성공/실패에 따른 메시지 표시
- 메인 페이지로 이동 기능

#### 4.8.2 UI 구성요소
- `Result`: 성공/실패 결과 표시
- `Descriptions`: 처리 상세 내역
- `Button`: 메인으로 이동 버튼

#### 4.8.3 인터랙션
- 처리 결과 표시
- 메인 페이지로 이동

## 5. 화면간 전환 및 네비게이션

### 5.1 라우팅 구조
```
/ (루트) → /login
/main
/bill/menu
/bill/result
/product/menu  
/product/selection
/product/request
/product/result
```

### 5.2 네비게이션 규칙
- **Protected Routes**: 로그인 후에만 접근 가능한 페이지
- **권한 기반 라우팅**: 사용자 권한에 따른 페이지 접근 제어
- **Back 버튼**: 모든 페이지에 일관된 뒤로가기 기능
- **Deep Link 지원**: URL을 통한 직접 페이지 접근

## 6. 반응형 설계 전략

### 6.1 브레이크포인트
- **Mobile**: 375px ~ 767px (기본)
- **Tablet**: 768px ~ 1023px  
- **Desktop**: 1024px 이상

### 6.2 반응형 원칙
- Mobile First 접근법
- Ant Design Grid 시스템 활용
- 터치 친화적 UI 요소 크기 (최소 44px)
- 콘텐츠 우선순위에 따른 레이아웃 조정

### 6.3 디바이스별 최적화
- **Mobile**: 단일 컬럼 레이아웃, 풀 스크린 모달
- **Tablet**: 2-3 컬럼 레이아웃, 사이드바 활용
- **Desktop**: 멀티 컬럼 레이아웃, 높은 정보 밀도

## 7. 접근성 보장 방안

### 7.1 웹 접근성 준수
- **WCAG 2.1 AA 레벨** 준수
- **키보드 네비게이션** 완전 지원
- **스크린 리더** 호환성
- **고대비 모드** 지원

### 7.2 구체적 구현사항
- `aria-label`, `aria-describedby` 등 ARIA 속성 활용
- 의미있는 HTML 시맨틱 구조
- 색상 외에 추가적인 시각적 단서 제공
- Focus indicator 명확히 표시
- 에러 메시지의 명확한 연결

## 8. 성능 최적화 방안

### 8.1 코드 최적화
- **Code Splitting**: React.lazy()를 통한 페이지별 지연 로딩
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Bundle 최적화**: Webpack/Vite 최적화 설정

### 8.2 런타임 최적화
- **React.memo()**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 비용이 높은 연산 최적화
- **Virtual Scrolling**: 긴 목록 성능 최적화

### 8.3 네트워크 최적화
- **API 응답 캐싱**: React Query 또는 SWR 활용
- **이미지 최적화**: WebP 포맷, 적절한 크기 조정
- **리소스 압축**: Gzip/Brotli 압축 활용

### 8.4 성능 목표
- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0초