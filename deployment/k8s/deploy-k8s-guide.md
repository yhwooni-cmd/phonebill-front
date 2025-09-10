# phonebill-front 쿠버네티스 배포 가이드

## 개요
phonebill 프론트엔드 서비스를 쿠버네티스 클러스터에 배포하기 위한 가이드입니다.

## 실행 정보
- **시스템명**: phonebill
- **서비스명**: phonebill-front  
- **ACR명**: acrdigitalgarage01
- **k8s명**: aks-digitalgarage-01
- **네임스페이스**: phonebill-dev
- **파드수**: 1
- **리소스(CPU)**: 256m/1024m
- **리소스(메모리)**: 256Mi/1024Mi
- **Gateway Host**: http://phonebill-api.20.214.196.128.nip.io
- **Frontend URL**: http://phonebill.20.214.196.128.nip.io

## 배포 가이드 검증 결과

### ✅ 모든 검증 항목 통과

1. **객체이름 네이밍룰 준수 여부** ✅
   - Ingress: phonebill-front ✅
   - ConfigMap: cm-phonebill-front ✅  
   - Service: phonebill-front ✅
   - Deployment: phonebill-front ✅

2. **Ingress Controller External IP 확인 및 반영** ✅
   ```bash
   # 실행한 명령어
   kubectl get svc ingress-nginx-controller -n ingress-nginx
   
   # 확인된 EXTERNAL-IP: 20.214.196.128
   # ingress.yaml host 설정: phonebill.20.214.196.128.nip.io ✅
   ```

3. **포트 설정 일치 확인** ✅
   - Ingress backend.service.port.number: 8080 ✅
   - Service port: 8080 ✅
   - Service targetPort: 8080 ✅

4. **이미지명 형식 확인** ✅
   - 형식: acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest ✅

5. **ConfigMap 데이터 내용 확인** ✅
   - key: runtime-env.js ✅
   - 백엔드 API 주소가 Gateway Host로 변경됨 ✅
     - 변경 전: 'http://localhost:8080'
     - 변경 후: 'http://phonebill-api.20.214.196.128.nip.io'

## 사전 확인 방법

### 1. Azure 로그인 상태 확인
```bash
az account show
```
- 올바른 Azure 구독에 로그인되어 있는지 확인

### 2. AKS Credential 확인
```bash
kubectl cluster-info
```
- 올바른 쿠버네티스 클러스터에 연결되어 있는지 확인

### 3. namespace 존재 확인
```bash
kubectl get ns phonebill-dev
```
- phonebill-dev 네임스페이스가 존재하는지 확인
- 네임스페이스가 없다면 생성:
```bash
kubectl create namespace phonebill-dev
```

## 매니페스트 적용 가이드

### 1. 매니페스트 파일 적용
```bash
kubectl apply -f deployment/k8s
```

### 2. 단계별 적용 (선택사항)
```bash
# ConfigMap 적용
kubectl apply -f deployment/k8s/configmap.yaml

# Service 적용  
kubectl apply -f deployment/k8s/service.yaml

# Deployment 적용
kubectl apply -f deployment/k8s/deployment.yaml

# Ingress 적용
kubectl apply -f deployment/k8s/ingress.yaml
```

## 배포 확인 방법

### 1. 전체 객체 생성 확인
```bash
kubectl get all -n phonebill-dev -l app=phonebill-front
```

### 2. 개별 객체 상태 확인

#### ConfigMap 확인
```bash
kubectl get configmap cm-phonebill-front -n phonebill-dev
kubectl describe configmap cm-phonebill-front -n phonebill-dev
```

#### Service 확인
```bash
kubectl get service phonebill-front -n phonebill-dev
```

#### Deployment 확인
```bash
kubectl get deployment phonebill-front -n phonebill-dev
kubectl describe deployment phonebill-front -n phonebill-dev
```

#### Pod 상태 확인
```bash
kubectl get pods -n phonebill-dev -l app=phonebill-front
kubectl describe pod <pod-name> -n phonebill-dev
```

#### Ingress 확인
```bash
kubectl get ingress phonebill-front -n phonebill-dev
kubectl describe ingress phonebill-front -n phonebill-dev
```

### 3. 로그 확인
```bash
# 최신 로그 확인
kubectl logs -n phonebill-dev -l app=phonebill-front

# 실시간 로그 모니터링
kubectl logs -n phonebill-dev -l app=phonebill-front -f
```

## 서비스 접속 정보

### 프론트엔드 서비스 URL
```
http://phonebill.20.214.196.128.nip.io
```

### API Gateway URL (백엔드)
```
http://phonebill-api.20.214.196.128.nip.io
```

## 생성된 매니페스트 파일 목록

1. `deployment/k8s/configmap.yaml` - 런타임 환경 설정
2. `deployment/k8s/service.yaml` - 서비스 정의
3. `deployment/k8s/deployment.yaml` - 애플리케이션 배포 정의
4. `deployment/k8s/ingress.yaml` - 외부 접근 경로 정의

## 주의사항

1. **이미지 준비**: 배포 전 ACR에 이미지가 업로드되어 있어야 함
2. **Secret 설정**: imagePullSecrets로 'phonebill' Secret이 생성되어 있어야 함
3. **Health Check**: /health 엔드포인트가 구현되어 있어야 함
4. **네트워크 정책**: 필요시 NetworkPolicy 추가 설정

## 문제 해결

### Pod가 시작되지 않는 경우
```bash
kubectl describe pod <pod-name> -n phonebill-dev
kubectl logs <pod-name> -n phonebill-dev
```

### 이미지 Pull 실패
```bash
# Secret 확인
kubectl get secret phonebill -n phonebill-dev

# Secret이 없는 경우 생성 필요
```

### Ingress 접근 불가
```bash
# Ingress Controller 상태 확인
kubectl get pods -n ingress-nginx

# DNS 설정 확인
nslookup phonebill.20.214.196.128.nip.io
```