pipeline {
    agent any
    
    environment {
        SYSTEM_NAME = 'phonebill'
        SERVICE_NAME = 'phonebill-front'
        ACR_NAME = 'acrdigitalgarage01'
        RESOURCE_GROUP = 'rg-digitalgarage-01'
        AKS_CLUSTER = 'aks-digitalgarage-01'
        
        DOCKER_IMAGE_NAME = "${ACR_NAME}.azurecr.io/${SYSTEM_NAME}/${SERVICE_NAME}"
        
        // 브랜치별 환경 설정
        TARGET_ENV = "${env.BRANCH_NAME == 'main' ? 'prod' : env.BRANCH_NAME == 'staging' ? 'staging' : 'dev'}"
        TARGET_NAMESPACE = "${TARGET_ENV}"
        IMAGE_TAG = "${TARGET_ENV}-${BUILD_NUMBER}"
    }
    
    tools {
        nodejs '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    
                    env.IMAGE_TAG = "${env.TARGET_ENV}-${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    // Docker Hub 로그인 (Rate Limit 해결)
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    }
                    
                    sh '''
                        npm ci
                    '''
                }
            }
        }
        
        stage('Lint Check') {
            steps {
                sh '''
                    npm run lint
                '''
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    
                    withSonarQubeEnv('SonarQube') {
                        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \\
                                -Dsonar.projectKey=${SERVICE_NAME} \\
                                -Dsonar.projectName=${SERVICE_NAME} \\
                                -Dsonar.sources=src \\
                                -Dsonar.sourceEncoding=UTF-8 \\
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                                -Dsonar.exclusions=node_modules/**,dist/**,build/**,**/*.test.ts,**/*.test.tsx \\
                                -Dsonar.login=${SONAR_TOKEN}
                            """
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Application') {
            steps {
                sh '''
                    npm run build
                '''
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def dockerImage = docker.build("${DOCKER_IMAGE_NAME}:${IMAGE_TAG}")
                    
                    env.BUILT_IMAGE = "${DOCKER_IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "Built Docker image: ${env.BUILT_IMAGE}"
                }
            }
        }
        
        stage('Push to ACR') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'acr-credentials', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
                        sh '''
                            echo $ACR_PASS | docker login ${ACR_NAME}.azurecr.io -u $ACR_USER --password-stdin
                            docker push ${BUILT_IMAGE}
                            
                            # latest 태그도 푸시 (환경별)
                            docker tag ${BUILT_IMAGE} ${DOCKER_IMAGE_NAME}:${TARGET_ENV}
                            docker push ${DOCKER_IMAGE_NAME}:${TARGET_ENV}
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to AKS') {
            steps {
                script {
                    withCredentials([azureServicePrincipal('azure-credentials')]) {
                        sh '''
                            # Azure CLI 로그인
                            az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
                            
                            # AKS 클러스터 연결
                            az aks get-credentials --resource-group ${RESOURCE_GROUP} --name ${AKS_CLUSTER} --overwrite-existing
                            
                            # Namespace 생성 (존재하지 않는 경우)
                            kubectl create namespace ${TARGET_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                            
                            # Kustomize를 사용하여 배포
                            cd k8s/overlays/${TARGET_ENV}
                            
                            # 이미지 태그 업데이트
                            kustomize edit set image ${DOCKER_IMAGE_NAME}=${BUILT_IMAGE}
                            
                            # 배포 실행
                            kubectl apply -k .
                            
                            # 배포 상태 확인
                            kubectl rollout status deployment/${SERVICE_NAME} -n ${TARGET_NAMESPACE} --timeout=300s
                            
                            # 서비스 상태 확인
                            kubectl get pods,svc -n ${TARGET_NAMESPACE} -l app=${SERVICE_NAME}
                        '''
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        # Pod 상태 확인
                        kubectl wait --for=condition=ready pod -l app=${SERVICE_NAME} -n ${TARGET_NAMESPACE} --timeout=300s
                        
                        # 서비스 엔드포인트 확인
                        kubectl get endpoints ${SERVICE_NAME} -n ${TARGET_NAMESPACE}
                        
                        echo "Deployment completed successfully!"
                        echo "Environment: ${TARGET_ENV}"
                        echo "Namespace: ${TARGET_NAMESPACE}"
                        echo "Image: ${BUILT_IMAGE}"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // 워크스페이스 정리
            cleanWs()
            
            // Docker 이미지 정리 (로컬)
            sh '''
                docker rmi ${BUILT_IMAGE} || true
                docker rmi ${DOCKER_IMAGE_NAME}:${TARGET_ENV} || true
                docker system prune -f || true
            '''
        }
        
        success {
            echo "Pipeline completed successfully!"
            echo "Deployed ${SERVICE_NAME} to ${TARGET_ENV} environment"
            
            // 성공 시 슬랙 알림 (선택사항)
            // slackSend channel: '#deployments', 
            //           color: 'good', 
            //           message: "✅ ${SERVICE_NAME} deployment to ${TARGET_ENV} succeeded!"
        }
        
        failure {
            echo "Pipeline failed!"
            
            // 실패 시 슬랙 알림 (선택사항)
            // slackSend channel: '#deployments', 
            //           color: 'danger', 
            //           message: "❌ ${SERVICE_NAME} deployment to ${TARGET_ENV} failed!"
        }
    }
}