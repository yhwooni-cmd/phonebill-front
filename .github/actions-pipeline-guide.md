# 프론트엔드 GitHub Actions CI/CD 파이프라인 가이드

## 📋 개요

이 가이드는 phonebill 프론트엔드 서비스를 GitHub Actions와 Kustomize를 사용하여 CI/CD 파이프라인을 구축하는 방법을 설명합니다.

## 🏗️ 구성 요소

### 시스템 정보
- **SYSTEM_NAME**: phonebill
- **SERVICE_NAME**: phonebill-front
- **ACR_NAME**: acrdigitalgarage01
- **RESOURCE_GROUP**: rg-digitalgarage-01
- **AKS_CLUSTER**: aks-digitalgarage-01
- **NODE_VERSION**: 20

### 파일 구조
```
.github/
├── workflows/
│   └── frontend-cicd.yaml          # GitHub Actions 워크플로우
├── kustomize/
│   ├── base/
│   │   ├── kustomization.yaml      # 기본 Kustomize 설정
│   │   ├── deployment.yaml         # 기본 Deployment
│   │   ├── service.yaml            # 기본 Service
│   │   ├── configmap.yaml          # 기본 ConfigMap
│   │   └── ingress.yaml            # 기본 Ingress
│   └── overlays/
│       ├── dev/                    # 개발 환경
│       │   ├── kustomization.yaml
│       │   ├── configmap-patch.yaml
│       │   ├── deployment-patch.yaml
│       │   └── ingress-patch.yaml
│       ├── staging/                # 스테이징 환경
│       │   ├── kustomization.yaml
│       │   ├── configmap-patch.yaml
│       │   ├── deployment-patch.yaml
│       │   └── ingress-patch.yaml
│       └── prod/                   # 운영 환경
│           ├── kustomization.yaml
│           ├── configmap-patch.yaml
│           ├── deployment-patch.yaml
│           └── ingress-patch.yaml
├── config/
│   ├── deploy_env_vars_dev         # 개발 환경 설정
│   ├── deploy_env_vars_staging     # 스테이징 환경 설정
│   └── deploy_env_vars_prod        # 운영 환경 설정
└── scripts/
    └── deploy-actions-frontend.sh  # 수동 배포 스크립트
```

## ⚙️ GitHub Repository 설정

### 1. Repository Secrets 설정

GitHub Repository > Settings > Secrets and variables > Actions > Repository secrets에서 다음 시크릿을 설정하세요:

#### Azure 인증 정보
```json
AZURE_CREDENTIALS:
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}
```

#### Azure Container Registry 인증 정보
ACR 인증 정보 확인:
```bash
az acr credential show --name acrdigitalgarage01
```

```
ACR_USERNAME: acrdigitalgarage01
ACR_PASSWORD: your-acr-password
```

#### SonarQube 설정
SonarQube 서버 URL 확인:
```bash
kubectl get svc -n sonarqube
```

```
SONAR_HOST_URL: http://your-sonarqube-external-ip
SONAR_TOKEN: your-sonarqube-token
```

SonarQube 토큰 생성:
1. SonarQube 로그인 후 우측 상단 'Administrator' > My Account 클릭
2. Security 탭 선택 후 토큰 생성

#### Docker Hub 인증 정보 (Rate Limit 방지)
```
DOCKERHUB_USERNAME: your-dockerhub-username
DOCKERHUB_PASSWORD: your-dockerhub-access-token
```

Docker Hub 액세스 토큰 생성:
1. Docker Hub(https://hub.docker.com) 로그인
2. 우측 상단 프로필 아이콘 > Account Settings
3. 좌측 메뉴 'Personal Access Tokens' 클릭하여 생성

### 2. Repository Variables 설정

GitHub Repository > Settings > Secrets and variables > Actions > Variables > Repository variables에서 다음 변수를 설정하세요:

```
ENVIRONMENT: dev                    # 기본 환경 (수동 실행 시 선택 가능)
SKIP_SONARQUBE: true               # SonarQube 분석 생략 여부
```

## 🚀 파이프라인 실행 방법

### 자동 실행
- **Push 이벤트**: main, develop 브랜치에 푸시 시 자동 실행 (ENVIRONMENT=dev, SKIP_SONARQUBE=true)
- **Pull Request**: main 브랜치로 PR 생성 시 자동 실행

### 수동 실행
1. GitHub Repository > Actions 탭 이동
2. "Frontend CI/CD" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 실행 옵션 선택:
   - **Target environment**: dev/staging/prod 선택
   - **Skip SonarQube Analysis**: true/false 선택
5. "Run workflow" 버튼 클릭하여 실행

## 📊 파이프라인 단계

### 1. Build and Test
- Node.js 20 환경 설정
- 의존성 설치 (`npm ci`)
- 프로젝트 빌드 (`npm run build`)
- ESLint 검사 (`npm run lint`)
- SonarQube 코드 분석 (옵션)
- 빌드 아티팩트 업로드

### 2. Build and Push Docker Image
- Docker 이미지 빌드
- Azure Container Registry에 푸시
- 이미지 태그: `{환경}-{타임스탬프}` 형식

### 3. Deploy to Kubernetes
- AKS 클러스터 접속
- 네임스페이스 생성 (`phonebill-{환경}`)
- Kustomize를 사용한 매니페스트 적용
- 배포 완료 대기 (최대 5분)

## 🌍 환경별 설정

### 개발 환경 (dev)
- **네임스페이스**: phonebill-dev
- **레플리카**: 1개
- **리소스**: CPU 256m/1024m, Memory 256Mi/1024Mi
- **도메인**: phonebill.20.214.196.128.nip.io (HTTP)
- **API 서버**: http://phonebill-api.20.214.196.128.nip.io

### 스테이징 환경 (staging)
- **네임스페이스**: phonebill-staging
- **레플리카**: 2개
- **리소스**: CPU 512m/2048m, Memory 512Mi/2048Mi
- **도메인**: phonebill-front-staging.example.com (HTTPS)
- **API 서버**: https://phonebill-api-staging.example.com

### 운영 환경 (prod)
- **네임스페이스**: phonebill-prod
- **레플리카**: 3개
- **리소스**: CPU 1024m/4096m, Memory 1024Mi/4096Mi
- **도메인**: phonebill-front-prod.example.com (HTTPS)
- **API 서버**: https://phonebill-api-prod.example.com

## 🔧 수동 배포 방법

### 스크립트 사용
```bash
# 개발 환경에 최신 태그로 배포
./.github/scripts/deploy-actions-frontend.sh dev latest

# 스테이징 환경에 특정 태그로 배포
./.github/scripts/deploy-actions-frontend.sh staging 20240315143022
```

### kubectl 직접 사용
```bash
# 네임스페이스 생성
kubectl create namespace phonebill-dev --dry-run=client -o yaml | kubectl apply -f -

# Kustomize로 배포
cd .github/kustomize/overlays/dev
kustomize edit set image acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:dev-20240315143022
kubectl apply -k .

# 배포 상태 확인
kubectl rollout status deployment/phonebill-front -n phonebill-dev
```

## 🔄 롤백 방법

### GitHub Actions에서 롤백
1. GitHub > Actions에서 성공한 이전 워크플로우 선택
2. "Re-run all jobs" 클릭

### kubectl을 사용한 롤백
```bash
# 이전 버전으로 롤백
kubectl rollout undo deployment/phonebill-front -n phonebill-dev --to-revision=2

# 롤백 상태 확인
kubectl rollout status deployment/phonebill-front -n phonebill-dev
```

### 수동 스크립트로 롤백
```bash
# 이전 안정 버전 이미지 태그로 재배포
./.github/scripts/deploy-actions-frontend.sh dev 20240314120000
```

## 📈 모니터링 및 로그

### 배포 상태 확인
```bash
# Pod 상태 확인
kubectl get pods -n phonebill-dev

# 서비스 상태 확인
kubectl get services -n phonebill-dev

# Ingress 상태 확인
kubectl get ingress -n phonebill-dev

# 배포 히스토리 확인
kubectl rollout history deployment/phonebill-front -n phonebill-dev
```

### 로그 확인
```bash
# 애플리케이션 로그
kubectl logs -f deployment/phonebill-front -n phonebill-dev

# 이벤트 확인
kubectl get events -n phonebill-dev --sort-by='.metadata.creationTimestamp'
```

## 🔒 SonarQube 설정

### 프로젝트 설정
- **프로젝트 키**: phonebill-front-{환경}
- **언어**: JavaScript/TypeScript
- **소스 경로**: src
- **테스트 경로**: src (*.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx)
- **제외 경로**: node_modules, dist, build, coverage

### Quality Gate 설정
```
Coverage: >= 70%
Duplicated Lines: <= 3%
Maintainability Rating: <= A
Reliability Rating: <= A
Security Rating: <= A
Code Smells: <= 50
Bugs: = 0
Vulnerabilities: = 0
```

## 🚨 문제 해결

### 일반적인 문제

#### 1. Docker 빌드 실패
- Dockerfile-frontend 경로 확인: `deployment/container/Dockerfile-frontend`
- 빌드 컨텍스트와 아티팩트 경로 확인

#### 2. Kustomize 적용 실패
- YAML 문법 오류 확인
- 리소스 이름과 네임스페이스 일치 확인
- 이미지 태그 형식 확인

#### 3. 배포 타임아웃
- 리소스 요청량이 클러스터 용량을 초과하는지 확인
- Health check 경로 `/health` 확인
- 네트워크 정책 및 보안 그룹 확인

#### 4. SonarQube 연결 실패
- SONAR_HOST_URL과 SONAR_TOKEN 값 확인
- 네트워크 접근성 확인
- SonarQube 서버 상태 확인

### 디버깅 명령어
```bash
# 파이프라인 상태 확인
kubectl get all -n phonebill-dev

# 이벤트 로그 확인
kubectl describe pod <pod-name> -n phonebill-dev

# Kustomize 출력 미리보기
cd .github/kustomize/overlays/dev
kustomize build .
```

## 📚 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Kustomize 공식 문서](https://kustomize.io/)
- [Azure Container Registry 문서](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Azure Kubernetes Service 문서](https://docs.microsoft.com/en-us/azure/aks/)
- [SonarQube 문서](https://docs.sonarqube.org/)

## ✅ 체크리스트

### 사전 준비 완료 체크
- [ ] GitHub Repository Secrets 설정 완료
- [ ] GitHub Repository Variables 설정 완료
- [ ] Azure 리소스 접근 권한 확인
- [ ] SonarQube 서버 접근 가능 여부 확인

### 파일 생성 완료 체크
- [ ] `.eslintrc.cjs` ESLint 설정 파일
- [ ] `.github/workflows/frontend-cicd.yaml` 워크플로우 파일
- [ ] `.github/kustomize/` 디렉토리 구조 및 매니페스트
- [ ] `.github/config/` 환경별 설정 파일
- [ ] `.github/scripts/deploy-actions-frontend.sh` 수동 배포 스크립트

### 검증 완료 체크
- [ ] `kubectl kustomize .github/kustomize/base/` 정상 실행
- [ ] 각 환경별 overlay 검증 완료
- [ ] GitHub Actions 워크플로우 문법 검증
- [ ] 스크립트 실행 권한 설정 완료

## 🎯 다음 단계

1. 첫 번째 파이프라인 실행 및 테스트
2. 각 환경별 도메인 및 인증서 설정 (staging/prod)
3. 실제 API 서버 주소로 ConfigMap 업데이트
4. 모니터링 및 알림 설정 추가
5. 성능 테스트 및 최적화