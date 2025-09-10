# 컨테이너 이미지 작성 과정

## 프로젝트 정보
- **서비스명**: phonebill-front (package.json의 "name" 필드에서 확인)
- **빌드 날짜**: 2025-01-10
- **Docker 이미지**: phonebill-front:latest

## 수행한 작업 순서

### 1. 서비스명 확인
```bash
# package.json 확인
cat package.json
```
- 서비스명: `phonebill-front`

### 2. 디렉토리 생성 및 dependency 동기화
```bash
# 컨테이너 관련 파일을 저장할 디렉토리 생성
mkdir -p deployment/container

# package.json과 package-lock.json 동기화
npm install
```

### 3. nginx.conf 파일 생성
```bash
# deployment/container/nginx.conf 파일 생성
# 포트 8080으로 설정, health check endpoint 포함
# 정적 파일 캐싱 및 SPA 라우팅 지원 설정
```

### 4. Dockerfile 생성
```bash
# deployment/container/Dockerfile-frontend 파일 생성
# Multi-stage 빌드: Node.js로 빌드 후 nginx로 서빙
# Build 단계: Node.js 20-slim 사용하여 애플리케이션 빌드
# Run 단계: nginx:stable-alpine으로 정적 파일 서빙
```

### 5. 컨테이너 이미지 빌드
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

**빌드 결과**:
- ✅ 빌드 성공
- 이미지 크기: 21.5MB
- 플랫폼: linux/amd64
- 포트: 8080

### 6. 생성된 이미지 확인
```bash
docker images | grep phonebill-front
```

**확인 결과**:
```
phonebill-front    latest    1bf77d798b4d   18 seconds ago   21.5MB
```

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
- **Multi-stage Build**: 최종 이미지 크기 최적화 (21.5MB)
- **SPA 지원**: React Router 등 클라이언트 사이드 라우팅 지원
- **정적 파일 캐싱**: CSS/JS 파일 1년 캐싱 설정
- **Health Check**: `/health` 엔드포인트로 컨테이너 상태 확인
- **보안**: Non-root 사용자로 실행
- **성능 최적화**: Gzip 압축 및 proxy 버퍼 설정

