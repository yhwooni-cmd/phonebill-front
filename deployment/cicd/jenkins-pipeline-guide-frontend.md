# 프론트엔드 Jenkins CI/CD 파이프라인 가이드

## 개요

이 문서는 **phonebill-front** 프로젝트의 Jenkins 기반 CI/CD 파이프라인 구축 및 운영 가이드입니다.

### 실행 정보
- **SYSTEM_NAME**: phonebill
- **SERVICE_NAME**: phonebill-front
- **ACR_NAME**: acrdigitalgarage01
- **RESOURCE_GROUP**: rg-digitalgarage-01
- **AKS_CLUSTER**: aks-digitalgarage-01

### 주요 기능
- **Kustomize 기반 환경별 배포**: dev/staging/prod 환경 분리
- **SonarQube 코드 품질 분석**: Quality Gate 적용
- **환경별 이미지 태그 관리**: 자동 타임스탬프 태그 생성
- **자동 파드 정리**: 파이프라인 완료 시 리소스 정리

## 1. Jenkins 서버 환경 구성

### 1.1 Jenkins 플러그인 설치

필수 플러그인:
```
- Kubernetes
- Pipeline Utility Steps
- Docker Pipeline
- GitHub
- SonarQube Scanner
- Azure Credentials
- EnvInject Plugin
```

### 1.2 Jenkins Credentials 등록

#### Azure Service Principal
```
Manage Jenkins > Credentials > Add Credentials
- Kind: Microsoft Azure Service Principal
- ID: azure-credentials
- Subscription ID: {구독ID}
- Client ID: {클라이언트ID}
- Client Secret: {클라이언트시크릿}
- Tenant ID: {테넌트ID}
- Azure Environment: Azure
```

#### ACR Credentials
```
- Kind: Username with password
- ID: acr-credentials
- Username: acrdigitalgarage01
- Password: {ACR_PASSWORD}
```

#### Docker Hub Credentials (Rate Limit 해결용)
```
- Kind: Username with password
- ID: dockerhub-credentials
- Username: {DOCKERHUB_USERNAME}
- Password: {DOCKERHUB_PASSWORD}
참고: Docker Hub 무료 계정 생성 (https://hub.docker.com)
```

#### SonarQube Token
```
- Kind: Secret text
- ID: sonarqube-token
- Secret: {SonarQube토큰}
```

## 2. 프로젝트 구조

### 2.1 CI/CD 디렉토리 구조
```
deployment/cicd/
├── kustomize/
│   ├── base/
│   │   ├── kustomization.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── ingress.yaml
│   └── overlays/
│       ├── dev/
│       │   ├── kustomization.yaml
│       │   ├── configmap-patch.yaml
│       │   ├── deployment-patch.yaml
│       │   └── ingress-patch.yaml
│       ├── staging/
│       │   └── ... (동일 구조)
│       └── prod/
│           └── ... (동일 구조)
├── config/
│   ├── deploy_env_vars_dev
│   ├── deploy_env_vars_staging
│   └── deploy_env_vars_prod
├── scripts/
│   ├── deploy.sh
│   └── validate-resources.sh
└── Jenkinsfile
```

### 2.2 환경별 구성

#### Dev 환경
- **네임스페이스**: phonebill-dev
- **레플리카**: 1
- **리소스**: 256m CPU, 256Mi Memory (requests)
- **도메인**: phonebill.20.214.196.128.nip.io
- **SSL**: 비활성화

#### Staging 환경  
- **네임스페이스**: phonebill-staging
- **레플리카**: 2
- **리소스**: 512m CPU, 512Mi Memory (requests)
- **도메인**: phonebill-front-staging.domain.com
- **SSL**: 활성화 (Let's Encrypt)

#### Prod 환경
- **네임스페이스**: phonebill-prod
- **레플리카**: 3
- **리소스**: 1024m CPU, 1024Mi Memory (requests)
- **도메인**: phonebill-front.domain.com
- **SSL**: 활성화 (Let's Encrypt)

## 3. Jenkins Pipeline Job 생성

### 3.1 Pipeline Job 설정
1. Jenkins 웹 UI에서 **New Item > Pipeline** 선택
2. **Pipeline script from SCM** 설정:
   ```
   SCM: Git
   Repository URL: {Git저장소URL}
   Branch: main (또는 develop)
   Script Path: deployment/cicd/Jenkinsfile
   ```

### 3.2 Pipeline Parameters 설정
```
ENVIRONMENT: Choice Parameter
- Choices: dev, staging, prod
- Default: dev
- Description: 배포 환경 선택

IMAGE_TAG: String Parameter
- Default: latest
- Description: 컨테이너 이미지 태그 (선택사항)
```

## 4. SonarQube 프로젝트 설정

### 4.1 SonarQube 프로젝트 생성
- SonarQube에서 프론트엔드 프로젝트 생성
- 프로젝트 키: `phonebill-front-{환경}`
- 언어: JavaScript/TypeScript

### 4.2 Quality Gate 설정
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

## 5. 배포 실행 방법

### 5.1 Jenkins 파이프라인 실행
```
1. Jenkins > {프로젝트명} > Build with Parameters
2. ENVIRONMENT 선택 (dev/staging/prod)
3. IMAGE_TAG 입력 (선택사항)
4. Build 클릭
```

### 5.2 수동 배포 실행
```bash
# 개발환경 배포
./deployment/cicd/scripts/deploy.sh dev

# 스테이징환경 배포
./deployment/cicd/scripts/deploy.sh staging

# 운영환경 배포
./deployment/cicd/scripts/deploy.sh prod latest
```

### 5.3 배포 상태 확인
```bash
kubectl get pods -n phonebill-{환경}
kubectl get services -n phonebill-{환경}
kubectl get ingress -n phonebill-{환경}
```

## 6. 파이프라인 단계별 설명

### 6.1 Get Source
- Git 소스코드 체크아웃
- 환경별 설정 파일 로드

### 6.2 Setup AKS
- Azure CLI 로그인
- AKS 클러스터 연결
- 네임스페이스 생성

### 6.3 Build & Test
- Node.js 의존성 설치
- 프론트엔드 빌드
- ESLint 검사

### 6.4 Code Analysis & Quality Gate
- SonarQube 코드 분석
- Quality Gate 검증
- 품질 기준 미달 시 파이프라인 중단

### 6.5 Build & Push Images
- 컨테이너 이미지 빌드
- ACR에 이미지 푸시
- 환경별 태그 적용 (`{환경}-{타임스탬프}`)

### 6.6 Update Kustomize & Deploy
- Kustomize 이미지 태그 업데이트
- Kubernetes 매니페스트 적용
- 배포 상태 확인

### 6.7 Pipeline Complete
- 파이프라인 완료 로그
- 자동 파드 정리

## 7. 리소스 검증

### 7.1 리소스 검증 스크립트 실행
```bash
./deployment/cicd/scripts/validate-resources.sh
```

### 7.2 검증 항목
- Base 디렉토리 필수 파일 존재 확인
- kustomization.yaml 리소스 참조 검증
- Kustomize 빌드 테스트
- 환경별 Overlay 검증

## 8. 롤백 방법

### 8.1 이전 버전으로 롤백
```bash
# 특정 버전으로 롤백
kubectl rollout undo deployment/phonebill-front -n phonebill-{환경} --to-revision=2

# 롤백 상태 확인
kubectl rollout status deployment/phonebill-front -n phonebill-{환경}
```

### 8.2 이미지 태그 기반 롤백
```bash
# 이전 안정 버전 이미지 태그로 업데이트
cd deployment/cicd/kustomize/overlays/{환경}
kustomize edit set image acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:{환경}-{이전태그}
kubectl apply -k .
```

## 9. 트러블슈팅

### 9.1 일반적인 문제

#### 빌드 실패
```bash
# Node.js 의존성 문제
npm ci --cache /root/.npm

# 빌드 타임아웃
# Jenkinsfile에서 timeout 설정 조정
```

#### 배포 실패
```bash
# 네임스페이스 확인
kubectl get namespaces | grep phonebill

# 이미지 풀 실패
kubectl describe pod -n phonebill-{환경}
```

#### SonarQube Quality Gate 실패
```bash
# 코드 품질 개선 후 재실행
# SonarQube 대시보드에서 상세 이슈 확인
```

### 9.2 로그 확인
```bash
# Jenkins 파이프라인 로그
Jenkins Console Output

# Kubernetes 이벤트
kubectl get events -n phonebill-{환경} --sort-by='.lastTimestamp'

# 파드 로그
kubectl logs -f deployment/phonebill-front -n phonebill-{환경}
```

## 10. 운영 가이드

### 10.1 정기 점검 항목
- [ ] SonarQube 품질 메트릭 확인
- [ ] 배포 성공률 모니터링  
- [ ] 리소스 사용량 확인
- [ ] 보안 스캔 결과 검토

### 10.2 성능 최적화
- 빌드 캐시 활용
- 파이프라인 병렬 처리
- 이미지 크기 최적화
- 리소스 요청량 조정

### 10.3 보안 고려사항
- Credentials 정기 교체
- 컨테이너 이미지 스캔
- RBAC 권한 최소화
- SSL 인증서 갱신

---

**작성일**: 2025년 9월 13일  
**버전**: 1.0.0  
**담당자**: DevOps Team