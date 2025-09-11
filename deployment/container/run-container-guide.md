# 프론트엔드 컨테이너 실행 가이드

이 가이드는 phonebill-front 서비스의 컨테이너 이미지를 VM에서 실행하는 방법을 안내합니다.

## 실행 정보

- **시스템명**: phonebill
- **ACR명**: acrdigitalgarage01
- **서비스명**: phonebill-front
- **VM 정보**:
  - KEY파일: ~/home/bastion-dg0500
  - USERID: azureuser
  - IP: 4.230.5.6

## 1. VM 접속 방법

### 터미널 실행
- **Linux/Mac**: 기본 터미널 실행
- **Windows**: Windows Terminal 실행

### VM 접속
```bash
# 최초 한번만 Private key 파일 권한 설정
chmod 400 ~/home/bastion-dg0500

# VM 접속
ssh -i ~/home/bastion-dg0500 azureuser@4.230.5.6
```

## 2. 컨테이너 이미지 생성

로컬에서 `deployment/container/build-image.md` 파일을 참고하여 컨테이너 이미지를 생성합니다.

## 3. 컨테이너 레지스트리 로그인

### ACR 인증정보 확인
```bash
az acr credential show --name acrdigitalgarage01
```

출력 예시:
```json
{
  "passwords": [
    {
      "name": "password",
      "value": "{암호}"
    },
    {
      "name": "password2",
      "value": "{암호2}"
    }
  ],
  "username": "acrdigitalgarage01"
}
```

### Docker 로그인
```bash
docker login acrdigitalgarage01.azurecr.io -u acrdigitalgarage01 -p {위에서 확인한 암호}
```

## 4. 컨테이너 이미지 푸시

### 이미지 태깅
```bash
docker tag phonebill-front:latest acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 이미지 푸시
```bash
docker push acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

## 5. 런타임 환경변수 파일 생성

VM에서 다음 명령으로 런타임 환경변수 파일을 생성합니다:

```bash
# 디렉토리 생성
mkdir -p ~/phonebill-front/public

# 환경변수 파일 생성
cat > ~/phonebill-front/public/runtime-env.js << 'EOF'
// 런타임 환경 설정
window.__runtime_config__ = {
  // API 서버 설정
  USER_HOST: 'http://4.230.5.6:8080',
  BILL_HOST: 'http://4.230.5.6:8080', 
  PRODUCT_HOST: 'http://4.230.5.6:8080',
  KOS_MOCK_HOST: 'http://4.230.5.6:8080',
  API_GROUP: '/api/v1',
  
  // 환경 설정
  NODE_ENV: 'production',
  
  // 기타 설정
  APP_NAME: '통신요금 관리 서비스',
  VERSION: '1.0.0'
};
EOF
```

## 6. 컨테이너 실행

```bash
SERVER_PORT=3000

docker run -d --name phonebill-front --rm -p ${SERVER_PORT}:8080 \
-v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

## 7. 실행 확인

```bash
# 컨테이너 실행 상태 확인
docker ps | grep phonebill-front

# 컨테이너 로그 확인
docker logs phonebill-front
```

## 8. 재배포 방법

### 8.1 컨테이너 이미지 재생성
로컬에서 다음 명령으로 이미지를 재생성합니다:
```bash
/deploy-build-image-front
```

### 8.2 컨테이너 이미지 푸시
로컬에서 다음 명령으로 이미지를 푸시합니다:
```bash
docker tag phonebill-front:latest acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
docker push acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 8.3 기존 컨테이너 중지
VM에 접속 후 다음 명령을 실행합니다:
```bash
docker stop phonebill-front
```

### 8.4 컨테이너 이미지 삭제
```bash
docker rmi acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 8.5 컨테이너 재실행
위의 "6. 컨테이너 실행" 섹션의 명령을 다시 실행합니다:
```bash
SERVER_PORT=3000

docker run -d --name phonebill-front --rm -p ${SERVER_PORT}:8080 \
-v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

## 9. 접속 확인

브라우저에서 다음 URL로 접속하여 서비스가 정상 동작하는지 확인합니다:
```
http://4.230.5.6:3000
```

## 주의사항

- VM에 접속하기 전에 Private Key 파일의 권한을 반드시 400으로 설정해야 합니다.
- 컨테이너 실행 시 포트 번호(3000)가 다른 서비스와 충돌하지 않는지 확인하세요.
- 재배포 시에는 반드시 기존 컨테이너를 중지하고 이미지를 삭제한 후 새로운 이미지로 실행해야 합니다.