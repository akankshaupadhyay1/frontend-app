pipeline {
    agent {
        docker {
            image 'xalien073/custom-dind-python-sonar-trivy:8'
            args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        DOCKER_IMAGE = "uakansha1/loan-predict-frontend:latest"
        SONAR_URL = 'http://20.44.59.222:9000'
    }

    stages {
        stage('Prepare Workspace') {
            steps {
                script {
                    sh 'rm -rf target && mkdir target'
                }
            }
        }

        stage('Checkout') {
            steps {
                sh '''
                    cd target
                    git clone https://github.com/uakansha1/frontend-app.git
                '''
            }
        }

        stage('Static Code Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                    sh """
                        cd target/frontend-app
                        sonar-scanner \
                        -Dsonar.projectKey=FRONTEND-APP \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_URL} \
                        -Dsonar.login=${SONAR_AUTH_TOKEN} \
                        -Dsonar.qualitygate.wait=true
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                        def status = sh(script: """
                            curl -s -u ${SONAR_AUTH_TOKEN}: "${SONAR_URL}/api/qualitygates/project_status?projectKey=FRONTEND-APP" | jq -r .projectStatus.status
                        """, returnStdout: true).trim()

                        if (status != "OK") {
                            error "❌ Quality Gate Failed! Stopping pipeline."
                        } else {
                            echo "✅ Quality Gate Passed!"
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker --version
                    echo "🐳 Building Docker image..."
                    docker build -t $DOCKER_IMAGE target/frontend-app
                """
            }
        }

        stage('Scan Docker Image') {
            steps {
                sh """
                    echo "🔍 Scanning Docker image with Trivy..."
                    trivy image --exit-code 1 --severity CRITICAL $DOCKER_IMAGE
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
                sh "docker push $DOCKER_IMAGE"
            }
        }

        stage('Update Helm Chart') {
            environment {
                GIT_REPO_NAME = "frontend-app"
                GIT_USER_NAME = "uakansha1"
            }
            steps {
                withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                    sh """
                        echo "✏️ Updating image tag in values.yaml..."
                        cd target/frontend-app
                        git config user.email "uakansha@example.com"
                        git config user.name "uakansha1"
                        sed -i 's|repository:.*|repository: uakansha1/loan-predict-frontend|' k8s/AKS/helm/frontend-app/values.yaml
                        sed -i 's/tag:.*/tag: latest/' k8s/AKS/helm/frontend-app/values.yaml
                        git add k8s/AKS/helm/frontend-app/values.yaml
                        git commit -m "🚀 Update frontend image to latest"
                        git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:main
                    """
                }
            }
        }
    }
}
