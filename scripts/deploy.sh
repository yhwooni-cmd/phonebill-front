#!/bin/bash

# 프론트엔드 수동 배포 스크립트
# Usage: ./scripts/deploy.sh [dev|staging|prod] [image-tag]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 사용법 출력
usage() {
    echo "Usage: $0 [ENVIRONMENT] [IMAGE_TAG]"
    echo ""
    echo "ENVIRONMENT: dev, staging, prod"
    echo "IMAGE_TAG: 배포할 이미지 태그 (선택사항, 기본값: latest)"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # dev 환경에 latest 이미지 배포"
    echo "  $0 prod v1.2.3            # prod 환경에 v1.2.3 이미지 배포"
    echo "  $0 staging dev-123-abc123  # staging 환경에 특정 태그 배포"
    exit 1
}

# 파라미터 검증
if [ $# -lt 1 ]; then
    log_error "환경을 지정해주세요."
    usage
fi

ENVIRONMENT=$1
IMAGE_TAG=${2:-"${ENVIRONMENT}"}

# 환경 검증
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "올바른 환경을 지정해주세요: dev, staging, prod"
    usage
fi

# 설정 값
SYSTEM_NAME="phonebill"
SERVICE_NAME="phonebill-front"
ACR_NAME="acrdigitalgarage01"
RESOURCE_GROUP="rg-digitalgarage-01"
AKS_CLUSTER="aks-digitalgarage-01"
NAMESPACE="$ENVIRONMENT"

DOCKER_IMAGE_NAME="${ACR_NAME}.azurecr.io/${SYSTEM_NAME}/${SERVICE_NAME}"
FULL_IMAGE_TAG="${DOCKER_IMAGE_NAME}:${IMAGE_TAG}"

log_info "======================================"
log_info "프론트엔드 수동 배포 시작"
log_info "======================================"
log_info "환경: $ENVIRONMENT"
log_info "네임스페이스: $NAMESPACE"
log_info "이미지: $FULL_IMAGE_TAG"
log_info "======================================"

# 필수 도구 확인
check_requirements() {
    log_info "필수 도구 확인 중..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl이 설치되어 있지 않습니다."
        exit 1
    fi
    
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI가 설치되어 있지 않습니다."
        exit 1
    fi
    
    if ! command -v kustomize &> /dev/null; then
        log_error "kustomize가 설치되어 있지 않습니다."
        exit 1
    fi
    
    log_success "필수 도구 확인 완료"
}

# Azure 로그인 확인
check_azure_login() {
    log_info "Azure 로그인 상태 확인 중..."
    
    if ! az account show &> /dev/null; then
        log_warning "Azure에 로그인되어 있지 않습니다."
        log_info "Azure 로그인을 진행합니다..."
        az login
    fi
    
    log_success "Azure 로그인 확인 완료"
}

# AKS 클러스터 연결
connect_aks() {
    log_info "AKS 클러스터 연결 중..."
    
    az aks get-credentials \
        --resource-group "$RESOURCE_GROUP" \
        --name "$AKS_CLUSTER" \
        --overwrite-existing
    
    log_success "AKS 클러스터 연결 완료"
}

# 네임스페이스 생성
create_namespace() {
    log_info "네임스페이스 확인/생성 중..."
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "네임스페이스 '$NAMESPACE'가 이미 존재합니다."
    else
        kubectl create namespace "$NAMESPACE"
        log_success "네임스페이스 '$NAMESPACE' 생성 완료"
    fi
}

# 이미지 존재 확인
check_image_exists() {
    log_info "이미지 존재 여부 확인 중..."
    
    # ACR에서 이미지 확인
    if az acr repository show-tags \
        --name "$ACR_NAME" \
        --repository "${SYSTEM_NAME}/${SERVICE_NAME}" \
        --output table | grep -q "$IMAGE_TAG"; then
        log_success "이미지가 ACR에 존재합니다: $FULL_IMAGE_TAG"
    else
        log_error "이미지가 ACR에 존재하지 않습니다: $FULL_IMAGE_TAG"
        log_info "사용 가능한 태그 목록:"
        az acr repository show-tags \
            --name "$ACR_NAME" \
            --repository "${SYSTEM_NAME}/${SERVICE_NAME}" \
            --output table
        exit 1
    fi
}

# 백업 생성
create_backup() {
    log_info "현재 배포 상태 백업 중..."
    
    BACKUP_DIR="./backups"
    BACKUP_FILE="${BACKUP_DIR}/backup-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).yaml"
    
    mkdir -p "$BACKUP_DIR"
    
    if kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" &> /dev/null; then
        kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o yaml > "$BACKUP_FILE"
        log_success "백업 생성 완료: $BACKUP_FILE"
    else
        log_warning "기존 배포가 존재하지 않습니다. 백업을 건너뜁니다."
    fi
}

# 배포 실행
deploy_application() {
    log_info "애플리케이션 배포 중..."
    
    # Kustomize 디렉토리로 이동
    cd "k8s/overlays/$ENVIRONMENT"
    
    # 이미지 태그 업데이트
    kustomize edit set image "$DOCKER_IMAGE_NAME=$FULL_IMAGE_TAG"
    
    # 배포 실행
    kubectl apply -k .
    
    log_success "배포 명령 실행 완료"
    
    # 원래 디렉토리로 복귀
    cd - > /dev/null
}

# 배포 상태 확인
check_deployment_status() {
    log_info "배포 상태 확인 중..."
    
    # 배포 롤아웃 상태 확인
    if kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=300s; then
        log_success "배포 롤아웃 완료"
    else
        log_error "배포 롤아웃 실패"
        exit 1
    fi
    
    # Pod 준비 상태 확인
    log_info "Pod 준비 상태 확인 중..."
    kubectl wait --for=condition=ready pod -l app="$SERVICE_NAME" -n "$NAMESPACE" --timeout=300s
    
    log_success "모든 Pod가 준비 상태입니다"
}

# 헬스 체크
health_check() {
    log_info "헬스 체크 수행 중..."
    
    # Pod 상태 확인
    log_info "Pod 상태:"
    kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME"
    
    # 서비스 상태 확인
    log_info "서비스 상태:"
    kubectl get svc -n "$NAMESPACE" -l app="$SERVICE_NAME"
    
    # 엔드포인트 확인
    log_info "엔드포인트 상태:"
    kubectl get endpoints "$SERVICE_NAME" -n "$NAMESPACE"
    
    log_success "헬스 체크 완료"
}

# 배포 정보 출력
print_deployment_info() {
    log_info "======================================"
    log_success "배포 완료!"
    log_info "======================================"
    log_info "환경: $ENVIRONMENT"
    log_info "네임스페이스: $NAMESPACE"
    log_info "서비스: $SERVICE_NAME"
    log_info "이미지: $FULL_IMAGE_TAG"
    log_info "======================================"
    
    # 현재 이미지 정보 출력
    log_info "현재 실행 중인 이미지:"
    kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}'
    echo ""
}

# 롤백 안내
print_rollback_info() {
    log_info "======================================"
    log_info "롤백이 필요한 경우:"
    log_info "======================================"
    echo "1. 이전 리비전으로 롤백:"
    echo "   kubectl rollout undo deployment/$SERVICE_NAME -n $NAMESPACE"
    echo ""
    echo "2. 특정 리비전으로 롤백:"
    echo "   kubectl rollout undo deployment/$SERVICE_NAME -n $NAMESPACE --to-revision=<revision-number>"
    echo ""
    echo "3. 롤아웃 히스토리 확인:"
    echo "   kubectl rollout history deployment/$SERVICE_NAME -n $NAMESPACE"
}

# 메인 실행 함수
main() {
    check_requirements
    check_azure_login
    connect_aks
    create_namespace
    check_image_exists
    create_backup
    deploy_application
    check_deployment_status
    health_check
    print_deployment_info
    print_rollback_info
}

# 스크립트 실행
main "$@"