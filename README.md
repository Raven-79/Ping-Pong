Welcome to the Ping Pong repository! This guide will walk you through the steps to set up and run the project on your local machine.

Prerequisites
Before you begin, ensure you have the following installed:

Docker
Docker Compose

Getting Started
1. Clone the Repository
    First, clone the repository to your local machine using the following command:
git clone git@github.com:Raven-79/Ping-Pong.git

2. Set Up Environment Variables
    Navigate to the project directory:
cd Ping-Pong
    Rename the .env_example file to .env:
mv .env_example .env
    Open the .env file and replace the placeholders with your actual keys:
SOCIAL_AUTH_42_KEY=your_42_key_here
SOCIAL_AUTH_42_SECRET=your_42_secret_here

3. Build and Run the Project
Use Docker Compose to build and run the project:
    docker-compose up --build
#This command will build the Docker images and start the containers as defined in the docker-compose.yml file.

4. Access the Project
Once the containers are up and running, you can access the project by navigating to the following URL in your web browser:
https://localhost:8443/#/
