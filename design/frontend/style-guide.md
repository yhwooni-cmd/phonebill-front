# 스타일가이드

## 1. 브랜드 아이덴티티

### 1.1 디자인 컨셉
- **전문성**: 통신요금 관리 서비스의 신뢰성과 안정성
- **사용자 친화성**: 직관적이고 이해하기 쉬운 인터페이스
- **현대적 감각**: 깔끔하고 미니멀한 현대적 디자인
- **접근성**: 모든 사용자가 쉽게 사용할 수 있는 포용적 디자인

### 1.2 브랜드 키워드
- 신뢰성 (Trust)
- 전문성 (Professional)  
- 직관성 (Intuitive)
- 효율성 (Efficient)

## 2. 디자인 원칙

### 2.1 핵심 원칙
1. **명확성**: 모든 UI 요소는 명확한 의미와 목적을 가져야 함
2. **일관성**: 전체 애플리케이션에서 일관된 패턴과 스타일 적용
3. **접근성**: WCAG 2.1 AA 기준 준수
4. **효율성**: 최소한의 클릭으로 목적을 달성할 수 있도록 설계
5. **피드백**: 사용자의 모든 액션에 대한 명확한 피드백 제공

### 2.2 상호작용 원칙
- **예측 가능성**: 사용자가 예측할 수 있는 인터랙션
- **관용성**: 실수에 대한 복구 기능 제공
- **학습 용이성**: 직관적인 UI로 학습 곡선 최소화

## 3. 컬러 시스템

### 3.1 Primary Colors (주색상)
```css
--primary-50: #E3F2FD;   /* 매우 연한 파랑 */
--primary-100: #BBDEFB;  /* 연한 파랑 */
--primary-200: #90CAF9;  /* 밝은 파랑 */
--primary-300: #64B5F6;  /* 중간 밝은 파랑 */
--primary-400: #42A5F5;  /* 밝은 파랑 */
--primary-500: #2196F3;  /* 기본 파랑 - 메인 브랜드 컬러 */
--primary-600: #1E88E5;  /* 진한 파랑 */
--primary-700: #1976D2;  /* 더 진한 파랑 */
--primary-800: #1565C0;  /* 매우 진한 파랑 */
--primary-900: #0D47A1;  /* 가장 진한 파랑 */
```

### 3.2 Neutral Colors (중성 색상)
```css
--gray-50: #FAFAFA;      /* 배경색 */
--gray-100: #F5F5F5;     /* 밝은 배경 */
--gray-200: #EEEEEE;     /* 경계선 */
--gray-300: #E0E0E0;     /* 비활성 상태 */
--gray-400: #BDBDBD;     /* 플레이스홀더 */
--gray-500: #9E9E9E;     /* 보조 텍스트 */
--gray-600: #757575;     /* 일반 텍스트 */
--gray-700: #616161;     /* 강조 텍스트 */
--gray-800: #424242;     /* 제목 텍스트 */
--gray-900: #212121;     /* 헤딩 텍스트 */
```

### 3.3 Status Colors (상태 색상)
```css
/* Success - 성공, 완료 */
--success-50: #E8F5E8;
--success-100: #C8E6C9;
--success-500: #4CAF50;   /* 메인 성공 색상 */
--success-700: #388E3C;

/* Warning - 주의, 경고 */
--warning-50: #FFF8E1;
--warning-100: #FFECB3;
--warning-500: #FF9800;   /* 메인 경고 색상 */
--warning-700: #F57C00;

/* Error - 오류, 실패 */
--error-50: #FFEBEE;
--error-100: #FFCDD2;
--error-500: #F44336;     /* 메인 오류 색상 */
--error-700: #D32F2F;

/* Info - 정보 */
--info-50: #E3F2FD;
--info-100: #BBDEFB;
--info-500: #2196F3;      /* 메인 정보 색상 */
--info-700: #1976D2;
```

### 3.4 컬러 사용 가이드
- **Primary**: 주요 액션 버튼, 링크, 활성 상태
- **Gray**: 텍스트, 배경, 경계선, 비활성 상태
- **Success**: 성공 메시지, 완료 상태
- **Warning**: 주의 메시지, 확인 필요한 상태
- **Error**: 오류 메시지, 실패 상태
- **Info**: 정보성 메시지, 도움말

## 4. 타이포그래피

### 4.1 폰트 패밀리
```css
/* 한글 폰트 */
--font-family-ko: 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', sans-serif;

/* 영문/숫자 폰트 */
--font-family-en: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* 코드/고정폭 폰트 */
--font-family-mono: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
```

### 4.2 폰트 크기 및 행간
```css
/* Display - 큰 제목 */
--font-size-display-lg: 57px;    line-height: 64px;
--font-size-display-md: 45px;    line-height: 52px;
--font-size-display-sm: 36px;    line-height: 44px;

/* Headline - 섹션 제목 */
--font-size-headline-lg: 32px;   line-height: 40px;
--font-size-headline-md: 28px;   line-height: 36px;
--font-size-headline-sm: 24px;   line-height: 32px;

/* Title - 카드/컴포넌트 제목 */
--font-size-title-lg: 22px;      line-height: 28px;
--font-size-title-md: 16px;      line-height: 24px;
--font-size-title-sm: 14px;      line-height: 20px;

/* Body - 본문 텍스트 */
--font-size-body-lg: 16px;       line-height: 24px;
--font-size-body-md: 14px;       line-height: 20px;
--font-size-body-sm: 12px;       line-height: 16px;

/* Label - 라벨, 캡션 */
--font-size-label-lg: 14px;      line-height: 20px;
--font-size-label-md: 12px;      line-height: 16px;
--font-size-label-sm: 11px;      line-height: 16px;
```

### 4.3 폰트 굵기
```css
--font-weight-light: 300;     /* 얇게 */
--font-weight-regular: 400;   /* 보통 */
--font-weight-medium: 500;    /* 중간 */
--font-weight-semibold: 600;  /* 반굵게 */
--font-weight-bold: 700;      /* 굵게 */
```

### 4.4 텍스트 용도별 스타일
- **Page Title**: headline-lg, weight-bold, color-gray-900
- **Section Title**: title-lg, weight-semibold, color-gray-800
- **Card Title**: title-md, weight-medium, color-gray-800
- **Body Text**: body-md, weight-regular, color-gray-700
- **Caption**: label-sm, weight-regular, color-gray-500
- **Button Text**: body-md, weight-medium

## 5. 간격 시스템

### 5.1 기본 간격 단위 (4px 기준)
```css
--space-1: 4px;     /* 0.25rem */
--space-2: 8px;     /* 0.5rem */
--space-3: 12px;    /* 0.75rem */
--space-4: 16px;    /* 1rem */
--space-5: 20px;    /* 1.25rem */
--space-6: 24px;    /* 1.5rem */
--space-8: 32px;    /* 2rem */
--space-10: 40px;   /* 2.5rem */
--space-12: 48px;   /* 3rem */
--space-16: 64px;   /* 4rem */
--space-20: 80px;   /* 5rem */
--space-24: 96px;   /* 6rem */
```

### 5.2 컴포넌트별 간격 가이드
- **페이지 여백**: space-6 (24px)
- **섹션 간 간격**: space-12 (48px)
- **카드 내부 패딩**: space-6 (24px)
- **폼 요소 간격**: space-4 (16px)
- **버튼 내부 패딩**: space-3 space-4 (12px 16px)
- **리스트 아이템 간격**: space-3 (12px)

## 6. 컴포넌트 스타일

### 6.1 Button (버튼)
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
  border-radius: 6px;
  padding: 12px 24px;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}
```

### 6.2 Input (입력 필드)
```css
.input-field {
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.input-field.error {
  border-color: var(--error-500);
}
```

### 6.3 Card (카드)
```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  border: 1px solid var(--gray-200);
}

.card-hover {
  transition: all 0.2s ease;
}

.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### 6.4 Form (폼)
```css
.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: 8px;
}

.form-help {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 4px;
}

.form-error {
  font-size: 12px;
  color: var(--error-500);
  margin-top: 4px;
}
```

## 7. 반응형 브레이크포인트

### 7.1 브레이크포인트 정의
```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

### 7.2 반응형 간격
- **Mobile**: 기본 간격의 75% 적용
- **Tablet**: 기본 간격 그대로 적용  
- **Desktop**: 기본 간격의 125% 적용

### 7.3 반응형 폰트
- **Mobile**: 기본 크기의 90% 적용
- **Tablet**: 기본 크기 그대로 적용
- **Desktop**: 기본 크기의 110% 적용

## 8. 대상 서비스 특화 컴포넌트

### 8.1 BillCard (요금 정보 카드)
- 청구 금액을 강조하는 큰 숫자 표시
- 상품명, 청구월 정보 명확히 구분
- 할인 정보는 success 컬러로 강조

### 8.2 ProductCard (상품 정보 카드)
- 월 요금을 primary 컬러로 강조
- 데이터/음성 허용량 아이콘과 함께 표시
- 선택된 상품은 primary border 적용

### 8.3 StatusBadge (상태 뱃지)
- 처리중: warning 컬러
- 완료: success 컬러  
- 실패: error 컬러
- 대기: gray 컬러

### 8.4 ProcessStepper (진행 단계)
- 현재 단계 primary 컬러 강조
- 완료된 단계 success 컬러
- 미진행 단계 gray 컬러

## 9. 인터랙션 패턴

### 9.1 호버 효과
```css
/* 카드 호버 */
.hover-lift {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 버튼 호버 */
.hover-darken {
  filter: brightness(0.95);
}
```

### 9.2 로딩 애니메이션
```css
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 9.3 페이드 인 애니메이션
```css
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 9.4 포커스 스타일
```css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

## 10. 다크 모드 고려사항

### 10.1 다크 모드 컬러 (향후 확장용)
```css
@media (prefers-color-scheme: dark) {
  --background: #121212;
  --surface: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
}
```

### 10.2 다크 모드 준비사항
- CSS 변수를 통한 색상 관리
- 이미지/아이콘의 다크 모드 버전 준비
- 콘트라스트 비율 유지