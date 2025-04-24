pipeline {
    agent {
        docker {
            image 'uakansha1/custom-image:latest'
            args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        DOCKER_IMAGE = "uakansha1/loan-predict-frontend:${env.BUILD_ID}"
        SONAR_URL = 'http://20.44.59.222:9000'
    }

    stages {
        stage('Prepare Workspace') {
            steps {
                sh 'rm -rf target && mkdir target'
            }
        }

        stage('Checkout') {
            steps {
                sh '''
                    cd target
                    git clone https://github.com/akankshaupadhyay1/frontend-app.git
                '''
            }
        }

        stage('Static Code Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                    sh """
                        cd target/frontend-app
                        sonar-scanner \\
                        -Dsonar.projectKey=frontend-app \\
                        -Dsonar.sources=. \\
                        -Dsonar.host.url=${SONAR_URL} \\
                        -Dsonar.login=${SONAR_AUTH_TOKEN} \\
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
                            curl -s -u ${SONAR_AUTH_TOKEN}: "${SONAR_URL}/api/qualitygates/project_status?projectKey=frontend-app" | jq -r .projectStatus.status
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
                    echo "🐳 Building frontend Docker image..."
                    docker build -t $DOCKER_IMAGE .
                    """
                    }
               }
        /*

        stage('Scan Docker Image') {
            steps {
                sh """
                    echo "🔍 Scanning frontend Docker image with Trivy..."
                    trivy image --exit-code 1 --severity CRITICAL $DOCKER_IMAGE
                """
            }
        }*/

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'my-dockerhub-creds', usernameVariable: 'my_user_name', passwordVariable: 'my_password')]) {
                    sh 'echo $my_password | docker login -u $my_user_name --password-stdin'
                    sh 'docker push $DOCKER_IMAGE'
                }
            }
        }

        stage('Update Helm Chart') {
            environment {
                GIT_REPO_NAME = "frontend-app"
                GIT_USER_NAME = "akankshaupadhyay1"
            }
            steps {
withCredentials([string(credentialsId: 'au-github', variable: 'GITHUB_TOKEN')]) { 
                    sh """
                        echo "✏️ Updating frontend image tag in frontend-deployment.yaml..."
                        cd target/frontend-app
                        git config user.email "uakansha1@gmail.com"
                        git config user.name "akankshaupadhyay1"
                        sed -i "s|\\(image: uakansha1/loan-predict-frontend:\\).*|\\1${env.BUILD_ID}|" k8s-commands/frontend-deployment.yaml
                        git add k8s-commands/frontend-deployment.yaml
                        git commit -m "🚀 Update frontend image to ${env.BUILD_ID}"
                        git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME}.git HEAD:main
                    """
                }
            }
        }
    }
}



