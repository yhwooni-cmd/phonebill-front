# 프론트엔드 Kubernetes 배포 가이드

## 배포 정보
- **시스템명**: phonebill
- **서비스명**: phonebill-front 
- **ACR명**: acrdigitalgarage01
- **K8s명**: aks-digitalgarage-01
- **네임스페이스**: phonebill-dev
- **파드수**: 1
- **리소스(CPU)**: 256m/1024m
- **리소스(메모리)**: 256Mi/1024Mi
- **Gateway Host**: http://phonebill-api.20.214.196.128.nip.io

## 배포가이드 검증 결과

### ✅ 체크리스트 검증 완료

1. **객체이름 네이밍룰 준수 여부**
   - ✅ Ingress: phonebill-front
   - ✅ ConfigMap: cm-phonebill-front
   - ✅ Service: phonebill-front
   - ✅ Deployment: phonebill-front

2. **Ingress Controller External IP 확인 및 매니페스트에 반영**
   ```bash
   kubectl get svc ingress-nginx-controller -n ingress-nginx
   ```
   - ✅ EXTERNAL-IP: 20.214.196.128 확인됨
   - ✅ ingress.yaml의 host: phonebill.20.214.196.128.nip.io 설정 완료

3. **포트 설정 검증**
   - ✅ Ingress 매니페스트의 backend.service.port.number: 8080
   - ✅ Service 매니페스트의 port: 8080
   - ✅ Service 매니페스트의 targetPort: 8080

4. **이미지명 검증**
   - ✅ Image: acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest

5. **ConfigMap 검증**
   - ✅ ConfigMap 이름: cm-phonebill-front
   - ✅ key: runtime-env.js
   - ✅ value에 백엔드 API 주소가 Gateway Host로 설정됨
     - USER_HOST: http://phonebill-api.20.214.196.128.nip.io
     - BILL_HOST: http://phonebill-api.20.214.196.128.nip.io
     - PRODUCT_HOST: http://phonebill-api.20.214.196.128.nip.io
     - KOS_MOCK_HOST: http://phonebill-api.20.214.196.128.nip.io

## 사전확인 방법

### 1. Azure 로그인 상태 확인
```bash
az account show
```

### 2. AKS Credential 확인
```bash
kubectl cluster-info
```

### 3. Namespace 존재 확인
```bash
kubectl get ns phonebill-dev
```

## 배포 실행 가이드

### 1. 매니페스트 적용
```bash
kubectl apply -f deployment/k8s/
```

### 2. 객체 생성 확인

#### ConfigMap 확인
```bash
kubectl get configmap cm-phonebill-front -n phonebill-dev
kubectl describe configmap cm-phonebill-front -n phonebill-dev
```

#### Service 확인
```bash
kubectl get service phonebill-front -n phonebill-dev
kubectl describe service phonebill-front -n phonebill-dev
```

#### Deployment 확인
```bash
kubectl get deployment phonebill-front -n phonebill-dev
kubectl describe deployment phonebill-front -n phonebill-dev
```

#### Pod 상태 확인
```bash
kubectl get pods -n phonebill-dev -l app=phonebill-front
kubectl logs -n phonebill-dev -l app=phonebill-front --follow
```

#### Ingress 확인
```bash
kubectl get ingress phonebill-front -n phonebill-dev
kubectl describe ingress phonebill-front -n phonebill-dev
```

### 3. 서비스 접속 확인
브라우저에서 아래 URL로 접속하여 서비스 동작 확인:
```
http://phonebill.20.214.196.128.nip.io
```

## 트러블슈팅

### Pod 시작 실패 시
```bash
# Pod 상태 확인
kubectl get pods -n phonebill-dev -l app=phonebill-front

# Pod 로그 확인
kubectl logs -n phonebill-dev [POD_NAME]

# Pod 상세 정보 확인
kubectl describe pod -n phonebill-dev [POD_NAME]
```

### 이미지 Pull 실패 시
```bash
# Secret 확인
kubectl get secret phonebill -n phonebill-dev

# Secret이 없으면 ACR 접근 권한 설정 필요
```

### Ingress 접속 실패 시
```bash
# Ingress Controller 상태 확인
kubectl get pods -n ingress-nginx

# Ingress 규칙 확인
kubectl get ingress phonebill-front -n phonebill-dev -o yaml
```

## 생성된 매니페스트 파일
- `deployment/k8s/configmap.yaml`: ConfigMap 설정
- `deployment/k8s/service.yaml`: Service 설정
- `deployment/k8s/deployment.yaml`: Deployment 설정
- `deployment/k8s/ingress.yaml`: Ingress 설정