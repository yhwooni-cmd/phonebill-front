# 통신요금 관리 서비스 프론트엔드 컨테이너 실행 가이드

## 개요
이 가이드는 phonebill-front 프론트엔드 서비스의 컨테이너 이미지를 Azure VM에서 실행하는 방법을 안내합니다.

## 실행 정보
- **시스템명**: phonebill-front
- **서비스명**: phonebill-front
- **ACR명**: acrdigitalgarage01
- **VM 정보**:
  - KEY파일: ~/home/bastion-P82157560@ktds.co.kr
  - USERID: azureuser
  - IP: 20.196.88.57

## 1. VM 접속 환경 준비

### 1.1 터미널 실행
- **Linux/Mac**: 기본 터미널 실행
- **Windows**: Windows Terminal 실행

### 1.2 Private Key 권한 설정 (최초 1회)
```bash
chmod 400 ~/home/bastion-P82157560@ktds.co.kr
```

### 1.3 VM 접속
```bash
ssh -i ~/home/bastion-P82157560@ktds.co.kr azureuser@20.196.88.57
```

## 2. 작업 환경 설정

### 2.1 작업 디렉토리 생성
```bash
mkdir -p ~/home/workspace
cd ~/home/workspace
```

### 2.2 Git Repository 클론
```bash
git clone https://github.com/cna-bootcamp/phonebill-front.git
cd phonebill-front
```

## 3. 컨테이너 이미지 준비

### 3.1 컨테이너 이미지 생성
`deployment/container/build-image.md` 파일을 열어 가이드대로 컨테이너 이미지를 생성하세요.

### 3.2 Azure Container Registry (ACR) 인증정보 확인
```bash
az acr credential show --name acrdigitalgarage01
```

출력 예시:
```json
{
  "passwords": [
    {
      "name": "password",
      "value": "your-password-here"
    },
    {
      "name": "password2",
      "value": "your-password2-here"
    }
  ],
  "username": "acrdigitalgarage01"
}
```

### 3.3 ACR 로그인
```bash
docker login acrdigitalgarage01.azurecr.io -u acrdigitalgarage01 -p {위에서_확인한_password}
```

### 3.4 컨테이너 이미지 태깅 및 푸시
```bash
# 이미지 태깅
docker tag phonebill-front:latest acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest

# 이미지 푸시
docker push acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

## 4. 런타임 환경 설정

### 4.1 런타임 환경변수 파일 생성
VM에서 다음 명령으로 런타임 환경설정 파일을 생성합니다:

```bash
cat > ~/phonebill-front/public/runtime-env.js << 'EOF'
// 런타임 환경 설정
window.__runtime_config__ = {
  // API 서버 설정 (localhost를 VM IP로 변경)
  USER_HOST: 'http://20.196.88.57:8080',
  BILL_HOST: 'http://20.196.88.57:8080',
  PRODUCT_HOST: 'http://20.196.88.57:8080',
  KOS_MOCK_HOST: 'http://20.196.88.57:8080',
  API_GROUP: '/api/v1',

  // 환경 설정
  NODE_ENV: 'production',

  // 기타 설정
  APP_NAME: '통신요금 관리 서비스',
  VERSION: '1.0.0'
};
EOF
```

## 5. 컨테이너 실행

### 5.1 컨테이너 실행 명령
```bash
SERVER_PORT=3000

docker run -d --name phonebill-front --rm -p ${SERVER_PORT}:8080 \
  -v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
  acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

### 5.2 실행 확인
```bash
# 컨테이너 상태 확인
docker ps | grep phonebill-front

# 서비스 접속 테스트
curl http://20.196.88.57:3000
```

## 6. 컨테이너 관리 명령어

### 6.1 컨테이너 상태 조회
```bash
# 모든 실행 중인 컨테이너
docker ps

# 특정 서비스만 확인
docker ps | grep phonebill-front

# 모든 컨테이너 (중지된 것 포함)
docker ps -a
```

### 6.2 컨테이너 로그 확인
```bash
# 실시간 로그 확인
docker logs -f phonebill-front

# 최근 로그 확인 (마지막 100줄)
docker logs --tail 100 phonebill-front
```

### 6.3 컨테이너 중지
```bash
docker stop phonebill-front
```

### 6.4 컨테이너 재시작
```bash
docker restart phonebill-front
```

## 7. 이미지 관리

### 7.1 이미지 목록 조회
```bash
docker images | grep phonebill-front
```

### 7.2 이미지 삭제
```bash
# 로컬 이미지 삭제
docker rmi phonebill-front:latest

# ACR 이미지 삭제
docker rmi acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

### 7.3 최신 이미지 풀
```bash
docker pull acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

## 8. 재배포 방법

서비스 수정 후 재배포 시 다음 절차를 따릅니다:

### 8.1 로컬에서 소스 수정 후 Git 푸시
```bash
# 로컬 개발환경에서
git add .
git commit -m "서비스 수정 사항"
git push origin main
```

### 8.2 VM에서 소스 업데이트
```bash
# VM 접속 후
cd ~/home/workspace/phonebill-front
git pull
```

### 8.3 컨테이너 이미지 재생성
`deployment/container/build-image.md` 파일을 참조하여 새로운 이미지를 생성합니다.

### 8.4 이미지 푸시
```bash
docker tag phonebill-front:latest acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
docker push acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

### 8.5 기존 컨테이너 중지
```bash
docker stop phonebill-front
```

### 8.6 기존 이미지 삭제
```bash
docker rmi acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

### 8.7 최신 이미지로 컨테이너 재실행
```bash
# 최신 이미지 풀
docker pull acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest

# 컨테이너 재실행
SERVER_PORT=3000

docker run -d --name phonebill-front --rm -p ${SERVER_PORT}:8080 \
  -v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
  acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

## 9. 트러블슈팅

### 9.1 컨테이너가 시작되지 않는 경우
```bash
# 컨테이너 로그 확인
docker logs phonebill-front

# 이미지가 존재하는지 확인
docker images | grep phonebill-front

# 포트가 이미 사용 중인지 확인
netstat -tulpn | grep 3000
```

### 9.2 ACR 로그인 실패
```bash
# Azure CLI 재로그인
az login

# ACR 자격 증명 다시 확인
az acr credential show --name acrdigitalgarage01
```

### 9.3 이미지 푸시 실패
```bash
# Docker 데몬 상태 확인
sudo systemctl status docker

# 디스크 공간 확인
df -h

# Docker 캐시 정리
docker system prune -f
```

### 9.4 서비스 접속 불가
```bash
# 방화벽 확인 (Ubuntu)
sudo ufw status

# 포트 개방 (필요 시)
sudo ufw allow 3000

# 컨테이너 내부 확인
docker exec -it phonebill-front /bin/sh
```

## 10. 모니터링 및 유지보수

### 10.1 시스템 리소스 모니터링
```bash
# CPU, 메모리 사용량
top
htop

# Docker 시스템 정보
docker system df

# 컨테이너 리소스 사용량
docker stats phonebill-front
```

### 10.2 정기 유지보수
```bash
# 사용하지 않는 Docker 리소스 정리
docker system prune -f

# 오래된 이미지 정리
docker image prune -a -f

# 로그 파일 크기 관리
docker logs --details phonebill-front 2>&1 | wc -l
```

### 10.3 헬스체크 스크립트
```bash
#!/bin/bash
# health-check.sh

SERVICE_NAME="phonebill-front"
PORT=3000

# 컨테이너 실행 상태 확인
if ! docker ps | grep -q $SERVICE_NAME; then
    echo "ERROR: $SERVICE_NAME container is not running"
    exit 1
fi

# 서비스 응답 확인
if ! curl -f http://20.196.88.57:$PORT > /dev/null 2>&1; then
    echo "ERROR: $SERVICE_NAME is not responding on port $PORT"
    exit 1
fi

echo "OK: $SERVICE_NAME is healthy"
exit 0
```

## 11. 보안 고려사항

### 11.1 네트워크 보안
```bash
# 방화벽 설정 확인
sudo ufw status

# 필요한 포트만 개방
sudo ufw allow from any to any port 3000 proto tcp
```

### 11.2 컨테이너 보안
```bash
# 권한이 없는 사용자로 컨테이너 실행 (Dockerfile에서 설정)
# --user 옵션 사용 가능
docker run -d --name phonebill-front --user 1000:1000 --rm -p 3000:8080 \
  -v ~/phonebill-front/public/runtime-env.js:/usr/share/nginx/html/runtime-env.js \
  acrdigitalgarage01.azurecr.io/phonebill-front/phonebill-front:latest
```

### 11.3 환경변수 보안
```bash
# 민감한 정보는 환경변수로 전달하지 않고 별도 설정 파일 사용
# docker run 시 --env-file 옵션 활용 가능
```

## 12. 접속 확인

브라우저에서 다음 URL로 접속하여 서비스가 정상 동작하는지 확인합니다:
```
http://20.196.88.57:3000
```

---

## 주의사항
1. 컨테이너 실행 전 반드시 이미지가 최신인지 확인
2. 포트 충돌이 없는지 사전 확인
3. 런타임 환경설정 파일의 IP 주소가 올바른지 확인
4. 재배포 시 기존 컨테이너와 이미지를 완전히 정리 후 진행
5. 로그 파일 크기가 과도하게 커지지 않도록 주기적 관리 필요

**문의사항이나 문제 발생 시 시스템 관리자에게 연락하시기 바랍니다.**