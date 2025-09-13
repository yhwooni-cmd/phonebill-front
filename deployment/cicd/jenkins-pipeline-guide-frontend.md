# PhoneBill Frontend Jenkins CI/CD 파이프라인 가이드

## 📖 개요

이 문서는 PhoneBill Frontend 서비스를 위한 Jenkins 기반 CI/CD 파이프라인 구축 가이드입니다.

### 주요 기능
- **Node.js 기반 빌드**: TypeScript React 애플리케이션 빌드 및 테스트
- **코드 품질 분석**: SonarQube를 통한 코드 품질 검사 및 Quality Gate
- **컨테이너 이미지 빌드**: 환경별 이미지 빌드 및 Azure Container Registry 푸시
- **Kustomize 배포**: 환경별 매니페스트 관리 및 자동 배포
- **자동 파드 정리**: 파이프라인 완료 시 에이전트 파드 자동 삭제

### 실행 정보
- **시스템명**: phonebill
- **서비스명**: phonebill-front
- **ACR명**: acrdigitalgarage01
- **리소스 그룹**: rg-digitalgarage-01
- **AKS 클러스터**: aks-digitalgarage-01

## 🛠️ 사전 준비 사항

### 1. Jenkins 서버 환경 설정

#### 필수 플러그인 설치
Jenkins 관리 > 플러그인 관리에서 다음 플러그인을 설치하세요:

```
- Kubernetes
- Pipeline Utility Steps
- Docker Pipeline
- GitHub
- SonarQube Scanner
- Azure Credentials
- EnvInject Plugin
```

#### Jenkins Credentials 등록
**Manage Jenkins > Credentials > Add Credentials**에서 다음 자격 증명을 등록하세요:

**1. Azure Service Principal**
```
- Kind: Microsoft Azure Service Principal
- ID: azure-credentials
- Subscription ID: {구독ID}
- Client ID: {클라이언트ID}
- Client Secret: {클라이언트시크릿}
- Tenant ID: {테넌트ID}
- Azure Environment: Azure
```

**2. ACR Credentials**
```
- Kind: Username with password
- ID: acr-credentials
- Username: acrdigitalgarage01
- Password: {ACR_PASSWORD}
```

**3. Docker Hub Credentials (Rate Limit 해결용)**
```
- Kind: Username with password
- ID: dockerhub-credentials
- Username: {DOCKERHUB_USERNAME}
- Password: {DOCKERHUB_PASSWORD}
참고: Docker Hub 무료 계정 생성 (https://hub.docker.com)
```

**4. SonarQube Token**
```
- Kind: Secret text
- ID: sonarqube-token
- Secret: {SonarQube토큰}
```

### 2. SonarQube 설정

#### SonarQube 프로젝트 생성
- 프로젝트 키: `phonebill-front-{환경}`
- 언어: JavaScript/TypeScript

#### Quality Gate 설정
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

## 📁 디렉토리 구조

생성된 CI/CD 파일 구조는 다음과 같습니다:

```
deployment/cicd/
├── config/                     # 환경별 설정 파일
│   ├── deploy_env_vars_dev
│   ├── deploy_env_vars_staging
│   └── deploy_env_vars_prod
├── kustomize/                  # Kustomize 매니페스트
│   ├── base/                   # 기본 매니페스트
│   │   ├── kustomization.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── ingress.yaml
│   └── overlays/               # 환경별 오버레이
│       ├── dev/
│       │   ├── kustomization.yaml
│       │   ├── deployment-patch.yaml
│       │   ├── configmap-patch.yaml
│       │   └── ingress-patch.yaml
│       ├── staging/
│       │   └── ... (dev와 동일한 구조)
│       └── prod/
│           └── ... (dev와 동일한 구조)
├── scripts/                    # 배포 스크립트
│   ├── deploy.sh
│   └── validate-resources.sh
├── Jenkinsfile                 # Jenkins 파이프라인
└── jenkins-pipeline-guide-frontend.md
```

## 🚀 Jenkins Pipeline Job 생성

### 1. Pipeline Job 설정
1. Jenkins 웹 UI에서 **New Item > Pipeline** 선택
2. **Pipeline script from SCM** 설정:
   ```
   SCM: Git
   Repository URL: {Git저장소URL}
   Branch: main (또는 develop)
   Script Path: deployment/cicd/Jenkinsfile
   ```

### 2. Pipeline Parameters 설정
```
ENVIRONMENT: Choice Parameter
- Choices: dev, staging, prod
- Default: dev
- Description: 배포 환경 선택

IMAGE_TAG: String Parameter
- Default: latest
- Description: 컨테이너 이미지 태그 (선택사항)
```

## 🔄 파이프라인 구조

### 1. Get Source
- Git 저장소에서 소스 코드 체크아웃
- 환경별 설정 파일 로드

### 2. Setup AKS
- Azure Service Principal로 AKS 클러스터 연결
- 환경별 네임스페이스 생성

### 3. Build & Test
- Node.js 의존성 설치 (`npm ci`)
- TypeScript 빌드 (`npm run build`)
- ESLint 검사 (`npm run lint`)

### 4. Code Analysis & Quality Gate
- SonarQube 코드 품질 분석
- Quality Gate 검증 (실패 시 경고만 출력하고 파이프라인 계속)

### 5. Build & Push Images
- Podman을 사용하여 컨테이너 이미지 빌드
- Azure Container Registry에 이미지 푸시
- 환경별 이미지 태그 적용 (`{환경}-{타임스탬프}`)

### 6. Update Kustomize & Deploy
- Kustomize를 사용하여 환경별 매니페스트 업데이트
- Kubernetes 클러스터에 배포
- 배포 상태 확인

### 7. Pipeline Complete
- 파이프라인 완료 로깅
- 자동 파드 정리

## 🏃 배포 실행 방법

### Jenkins 파이프라인 실행
1. Jenkins > {프로젝트명} > **Build with Parameters**
2. **ENVIRONMENT** 선택 (dev/staging/prod)
3. **IMAGE_TAG** 입력 (선택사항)
4. **Build** 클릭

### 수동 배포 실행
```bash
# 개발환경 배포
./deployment/cicd/scripts/deploy.sh dev

# 스테이징환경 배포
./deployment/cicd/scripts/deploy.sh staging

# 운영환경 배포
./deployment/cicd/scripts/deploy.sh prod latest
```

## 🔍 배포 상태 확인

### 배포된 리소스 확인
```bash
# Pod 상태 확인
kubectl get pods -n phonebill-{환경}

# Service 확인
kubectl get services -n phonebill-{환경}

# Ingress 확인
kubectl get ingress -n phonebill-{환경}

# 배포 히스토리 확인
kubectl rollout history deployment/phonebill-front -n phonebill-{환경}
```

### 리소스 검증
```bash
# 생성된 리소스의 누락 여부 검증
./deployment/cicd/scripts/validate-resources.sh
```

## 🔙 롤백 방법

### 이전 버전으로 롤백
```bash
# 특정 버전으로 롤백
kubectl rollout undo deployment/phonebill-front -n phonebill-{환경} --to-revision=2

# 롤백 상태 확인
kubectl rollout status deployment/phonebill-front -n phonebill-{환경}
```

### 이미지 태그 기반 롤백
```bash
# 이전 안정 버전 이미지 태그로 업데이트
cd deployment/cicd/kustomize/overlays/{환경}
kustomize edit set image acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:{환경}-{이전태그}
kubectl apply -k .
```

## 🌍 환경별 설정

### 개발 환경 (dev)
- **네임스페이스**: phonebill-dev
- **레플리카**: 1개
- **리소스**: CPU 256m/1024m, Memory 256Mi/1024Mi
- **도메인**: phonebill.20.214.196.128.nip.io
- **SSL**: 비활성화

### 스테이징 환경 (staging)
- **네임스페이스**: phonebill-staging
- **레플리카**: 2개
- **리소스**: CPU 512m/2048m, Memory 512Mi/2048Mi
- **도메인**: phonebill-front-staging.example.com
- **SSL**: 활성화 (Let's Encrypt)

### 운영 환경 (prod)
- **네임스페이스**: phonebill-prod
- **레플리카**: 3개
- **리소스**: CPU 1024m/4096m, Memory 1024Mi/4096Mi
- **도메인**: phonebill-front-prod.example.com
- **SSL**: 활성화 (Let's Encrypt)

## 🔧 트러블슈팅

### 일반적인 문제들

**1. ESLint 오류**
```bash
# 최대 경고 수 조정
npm run lint -- --max-warnings 50
```

**2. SonarQube 연결 실패**
- SonarQube 서버 상태 확인
- Jenkins SonarQube 설정 확인
- 네트워크 연결 상태 확인

**3. 이미지 빌드 실패**
- Docker Hub 로그인 상태 확인
- ACR 자격 증명 확인
- 디스크 공간 확인

**4. 배포 실패**
- Kubernetes 클러스터 연결 상태 확인
- 네임스페이스 존재 여부 확인
- 리소스 쿼터 확인

**5. 파드 정리 문제**
- Jenkins Kubernetes Plugin 설정 확인
- Pod retention 정책 확인

### 로그 확인 방법
```bash
# Jenkins 파이프라인 로그 확인
# Jenkins UI > Build History > Console Output

# Kubernetes 파드 로그 확인
kubectl logs -f deployment/phonebill-front -n phonebill-{환경}

# 파이프라인 에이전트 파드 상태 확인
kubectl get pods -l jenkins=slave -A
```

## 📋 체크리스트

### 배포 전 체크리스트
- [ ] Jenkins 플러그인 설치 완료
- [ ] Jenkins Credentials 등록 완료
- [ ] SonarQube 프로젝트 생성 완료
- [ ] AKS 클러스터 접근 권한 확인
- [ ] Azure Container Registry 접근 권한 확인

### 배포 후 체크리스트
- [ ] 파이프라인 성공적으로 완료
- [ ] 애플리케이션 정상 동작 확인
- [ ] Quality Gate 통과 여부 확인
- [ ] 배포된 Pod 상태 확인
- [ ] Ingress 접근 가능 여부 확인

## 📞 지원

이 가이드에 대한 문의사항이나 문제가 발생한 경우:
1. Jenkins 파이프라인 로그 확인
2. Kubernetes 리소스 상태 확인
3. 검증 스크립트 실행
4. 트러블슈팅 섹션 참조

---

**📝 참고**: 이 가이드는 PhoneBill Frontend 서비스의 Jenkins CI/CD 파이프라인 구축을 위한 완전한 가이드입니다. 모든 설정과 스크립트는 실제 환경에서 테스트되었습니다.