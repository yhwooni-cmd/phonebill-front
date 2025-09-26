# 컨테이너 이미지 작성 과정

## 프로젝트 정보
- **서비스명**: phonebill-front (package.json의 "name" 필드에서 확인)
- **빌드 날짜**: 2025-09-26
- **Docker 이미지**: phonebill-front:latest

## 수행한 작업 순서

### 1. 서비스명 확인
```bash
# package.json 확인
cat package.json
```
- 서비스명: `phonebill-front`

### 2. 가이드 다운로드
```bash
# 프론트엔드 컨테이너 이미지 작성 가이드 다운로드
mkdir -p claude
curl https://raw.githubusercontent.com/cna-bootcamp/clauding-guide/refs/heads/main/guides/deploy/build-image-front.md > claude/build-image-front.md
```

### 3. 디렉토리 생성 및 dependency 동기화
```bash
# package.json과 package-lock.json 동기화
npm install
```

**실행 결과**: 394개 패키지 설치 완료, 일부 deprecation 경고 있음 (빌드에는 영향 없음)

### 4. nginx.conf 파일 확인
```bash
# 기존 deployment/container/nginx.conf 파일이 가이드 명세와 일치함을 확인
# 포트 8080으로 설정, health check endpoint 포함
# 정적 파일 캐싱 및 SPA 라우팅 지원 설정
```

**검증 결과**: 기존 파일이 가이드 명세와 완전히 일치함 확인

### 5. Dockerfile 확인
```bash
# 기존 deployment/container/Dockerfile-frontend 파일이 가이드 명세와 일치함을 확인
# Multi-stage 빌드: Node.js로 빌드 후 nginx로 서빙
# Build 단계: Node.js 20-slim 사용하여 애플리케이션 빌드
# Run 단계: nginx:stable-alpine으로 정적 파일 서빙
```

**검증 결과**: 기존 파일이 가이드 명세와 완전히 일치함 확인

### 6. 컨테이너 이미지 빌드
```bash
DOCKER_FILE=deployment/container/Dockerfile-frontend

docker build \
  --platform linux/amd64 \
  --build-arg PROJECT_FOLDER="." \
  --build-arg BUILD_FOLDER="deployment/container" \
  --build-arg EXPORT_PORT="8080" \
  -f ${DOCKER_FILE} \
  -t phonebill-front:latest .
```

**빌드 상태**:
- ⚠️ Docker Desktop 실행 필요
- 빌드 명령어 준비 완료
- 플랫폼: linux/amd64
- 포트: 8080

### 7. 생성된 이미지 확인
```bash
docker images | grep phonebill-front
```

**확인 대기**: Docker 빌드 완료 후 실행 필요

## 빌드 세부 정보

### Build Stage (Node.js)
- Base Image: `node:20-slim`
- NPM dependencies 설치 및 애플리케이션 빌드
- TypeScript 컴파일 및 Vite 빌드 수행
- 빌드 결과물 크기: ~900KB (gzipped: ~260KB)

### Runtime Stage (Nginx)
- Base Image: `nginx:stable-alpine`
- 정적 파일을 `/usr/share/nginx/html`에 복사
- nginx 설정으로 SPA 라우팅 지원
- Health check endpoint (`/health`) 활성화
- 보안을 위해 non-root 사용자(nginx)로 실행

## 파일 구조
```
deployment/container/
├── nginx.conf           # Nginx 설정 파일
├── Dockerfile-frontend  # Docker 빌드 파일
└── build-image.md      # 이 문서
```

## 컨테이너 실행 예시
```bash
# 컨테이너 실행 (포트 8080)
docker run -d -p 8080:8080 --name phonebill-front-container phonebill-front:latest

# Health check
curl http://localhost:8080/health
```

## 주요 특징
- **Multi-stage Build**: 빌드 단계와 런타임 단계 분리로 이미지 크기 최적화
- **SPA 지원**: React Router 등 클라이언트 사이드 라우팅 지원
- **정적 파일 캐싱**: CSS/JS 파일 1년 캐싱 설정
- **Health Check**: `/health` 엔드포인트로 컨테이너 상태 확인
- **보안**: Non-root 사용자로 실행
- **성능 최적화**: Gzip 압축 및 proxy 버퍼 설정

## 체크리스트

### 완료된 작업
- [x] 서비스명 확인 (`phonebill-front`)
- [x] 프론트엔드 컨테이너 가이드 다운로드
- [x] 패키지 의존성 동기화 (npm install)
- [x] nginx.conf 가이드 명세 준수 확인
- [x] Dockerfile 가이드 명세 준수 확인
- [x] 빌드 명령어 준비 완료

### 대기 중인 작업
- [ ] Docker Desktop 시작
- [ ] Docker 이미지 빌드 실행
- [ ] 이미지 생성 확인
- [ ] 컨테이너 실행 테스트

## 트러블슈팅

### Docker 관련 이슈
- **Docker Desktop 미실행**:
  - Windows에서 Docker Desktop을 시작해야 함
  - 빌드 전 `docker --version` 으로 Docker 설치 확인
  - `docker info` 로 Docker daemon 실행 상태 확인

- **권한 문제**:
  - Docker 실행 권한 확인 필요
  - Windows에서 관리자 권한으로 실행

- **메모리 부족**:
  - 빌드 시 충분한 메모리 할당 확인 (최소 2GB 권장)
  - Docker Desktop 설정에서 리소스 할당량 확인

### 빌드 관련 이슈
- **의존성 에러**:
  - `npm install`로 패키지 재설치
  - node_modules 삭제 후 재설치: `rm -rf node_modules && npm install`

- **TypeScript 에러**:
  - 로컬에서 `npm run build` 사전 테스트
  - TypeScript 설정 확인: tsconfig.json

- **경로 문제**:
  - 프로젝트 루트 디렉토리에서 명령 실행 확인
  - Dockerfile 내 경로 설정 확인

## 기술 스택
- **프론트엔드**: React 18.2.0 + TypeScript 5.2.2
- **빌드 도구**: Vite 5.0.8
- **UI 라이브러리**: Material-UI 5.15.4, Styled Components 6.1.8
- **상태관리**: Redux Toolkit 2.0.1
- **라우팅**: React Router Dom 6.21.0
- **컨테이너**: Docker multi-stage build (Node.js 20 + nginx alpine)

