# 프론트엔드 컨테이너 실행 가이드

## 실행 정보
- **시스템명**: phonebill
- **서비스명**: phonebill-front
- **ACR명**: acrdigitalgarage01
- **VM 접속 정보**:
  - KEY파일: ~/home/bastion-dg0500
  - USERID: azureuser
  - IP: 4.230.5.6

## 1. 서비스 확인

### 서비스명 확인
```bash
# package.json에서 서비스명 확인
cat package.json | grep "name"
```
**서비스명**: `phonebill-front`

### 생성된 컨테이너 이미지 확인
```bash
docker images | grep phonebill-front
```

## 2. 컨테이너 레지스트리(ACR) 로그인

### ACR 인증 정보 확인
```bash
az acr credential show --name acrdigitalgarage01
```

예시 응답:
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

### Docker 레지스트리 로그인
```bash
# 로컬에서 실행
docker login acrdigitalgarage01.azurecr.io -u {username} -p {password}
```

## 3. 컨테이너 이미지 푸시

### 이미지 태깅
```bash
docker tag phonebill-front:latest acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 이미지 푸시
```bash
docker push acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

## 4. VM 접속

### 터미널 실행
- **Linux/Mac**: 기본 터미널 실행
- **Windows**: Windows Terminal 실행

### SSH 키 권한 설정 (최초 1회)
```bash
chmod 400 ~/home/bastion-dg0500
```

### VM 접속
```bash
ssh -i ~/home/bastion-dg0500 azureuser@4.230.5.6
```

### VM에서 Docker 로그인
```bash
docker login acrdigitalgarage01.azurecr.io -u {username} -p {password}
```

## 5. 런타임 환경변수 파일 생성

### VM에서 디렉토리 생성
```bash
mkdir -p ~/phonebill-front/public
```

### 런타임 환경변수 파일 생성
```bash
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

### 컨테이너 실행 명령
```bash
SERVER_PORT=3000

docker run -d --name phonebill-front --rm -p ${SERVER_PORT}:8080 \
-v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 실행 확인
```bash
docker ps | grep phonebill-front
```

### 서비스 접속 확인
```bash
# Health check
curl http://4.230.5.6:3000/health

# 서비스 접속 (브라우저)
# http://4.230.5.6:3000
```

## 7. 컨테이너 관리 명령어

### 컨테이너 로그 확인
```bash
docker logs phonebill-front
```

### 컨테이너 중지
```bash
docker stop phonebill-front
```

### 컨테이너 재시작
```bash
docker start phonebill-front
```

## 8. 재배포 방법

### 8.1 컨테이너 이미지 재생성 (로컬)
```bash
# 로컬에서 이미지 재빌드
DOCKER_FILE=deployment/container/Dockerfile-frontend

docker build \
  --platform linux/amd64 \
  --build-arg PROJECT_FOLDER="." \
  --build-arg BUILD_FOLDER="deployment/container" \
  --build-arg EXPORT_PORT="8080" \
  -f ${DOCKER_FILE} \
  -t phonebill-front:latest .
```

### 8.2 컨테이너 이미지 푸시 (로컬)
```bash
# 이미지 태깅 및 푸시
docker tag phonebill-front:latest acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
docker push acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 8.3 컨테이너 중지 (VM)
```bash
# VM 접속 후 실행
docker stop phonebill-front
```

### 8.4 컨테이너 이미지 삭제 (VM)
```bash
docker rmi acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 8.5 컨테이너 재실행 (VM)
```bash
# 최신 이미지 pull
docker pull acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest

# 컨테이너 재실행
SERVER_PORT=3000

docker run -d --name phonebill-front --rm -p ${SERVER_PORT}:8080 \
-v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

## 9. 트러블슈팅

### 포트 충돌 시
```bash
# 사용 중인 포트 확인
sudo netstat -tulpn | grep :3000

# 다른 포트 사용
SERVER_PORT=3001
```

### 컨테이너 강제 삭제
```bash
docker rm -f phonebill-front
```

### 이미지 강제 삭제
```bash
docker rmi -f acrdigitalgarage01.azurecr.io/phonebill/phonebill-front:latest
```

### 로그 확인
```bash
# 컨테이너 로그
docker logs -f phonebill-front

# Nginx 에러 로그 
docker exec phonebill-front cat /var/log/nginx/error.log
```

## 10. 보안 고려사항

- SSH 키 파일 권한: 400 (소유자만 읽기)
- 컨테이너는 non-root 사용자로 실행
- ACR 인증 정보는 보안 저장소에 관리 권장
- 환경변수 파일에 민감 정보 포함 금지