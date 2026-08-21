pipeline {
  agent any

  environment {
    DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    DOCKER_HUB_USER  = credentials('docker-hub-username')
    EC2_HOST         = credentials('ec2-host')
    EC2_SSH_KEY      = credentials('ec2-ssh-key')
    IMAGE_TAG        = "${env.GIT_COMMIT?.take(7) ?: env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        echo "Branch: ${env.BRANCH_NAME}"
        echo "Commit: ${env.GIT_COMMIT}"
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker-compose build'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'docker-compose run --rm node-backend npm test || true'
        sh 'docker-compose run --rm python-backend python -m pytest || true'
      }
    }

    stage('Push to Docker Hub') {
      when { branch 'main' }
      steps {
        sh '''
          echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin

          docker tag careernav-1-node-backend $DOCKER_HUB_USER/careernav-node:$IMAGE_TAG
          docker tag careernav-1-node-backend $DOCKER_HUB_USER/careernav-node:latest
          docker push $DOCKER_HUB_USER/careernav-node:$IMAGE_TAG
          docker push $DOCKER_HUB_USER/careernav-node:latest

          docker tag careernav-1-python-backend $DOCKER_HUB_USER/careernav-python:$IMAGE_TAG
          docker tag careernav-1-python-backend $DOCKER_HUB_USER/careernav-python:latest
          docker push $DOCKER_HUB_USER/careernav-python:$IMAGE_TAG
          docker push $DOCKER_HUB_USER/careernav-python:latest
        '''
      }
    }

    stage('Deploy to AWS EC2') {
      when { branch 'main' }
      steps {
        sh '''
          ssh -i $EC2_SSH_KEY -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "
            cd /home/ubuntu/careernav &&
            docker-compose -f docker-compose.prod.yml pull &&
            docker-compose -f docker-compose.prod.yml up -d --no-deps &&
            docker image prune -f
          "
        '''
      }
    }
  }

  post {
    success { echo '✅ Pipeline succeeded!' }
    failure  { echo '❌ Pipeline failed!' }
    always   { sh 'docker system prune -f || true' }
  }
}
