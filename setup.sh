#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print with color
print_color() {
    color=$1
    message=$2
    printf "${color}${message}${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_color $BLUE "Checking prerequisites..."
    
    if ! command_exists node; then
        print_color $RED "Node.js is not installed. Please install Node.js version 14 or higher."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_color $RED "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_color $RED "Docker is not installed. Please install Docker to use containerized deployment."
        print_color $BLUE "You can still run the application without Docker."
    fi
    
    print_color $GREEN "Prerequisites check completed."
}

# Setup environment variables
setup_env() {
    print_color $BLUE "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_color $GREEN "Created .env file from template."
        print_color $BLUE "Please update the .env file with your configuration."
    else
        print_color $BLUE ".env file already exists. Skipping..."
    fi
}

# Install dependencies
install_dependencies() {
    print_color $BLUE "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    print_color $GREEN "Dependencies installed successfully."
}

# Build the application
build_app() {
    print_color $BLUE "Building the application..."
    
    # Build client
    cd client
    npm run build
    cd ..
    
    print_color $GREEN "Application built successfully."
}

# Setup database
setup_database() {
    print_color $BLUE "Setting up database..."
    
    if command_exists docker; then
        docker-compose up -d mongo
        print_color $GREEN "MongoDB container started."
    else
        print_color $BLUE "Please ensure MongoDB is running locally on port 27017"
    fi
}

# Run the application
run_app() {
    print_color $BLUE "Starting the application..."
    
    if command_exists docker; then
        docker-compose up -d
        print_color $GREEN "Application started in Docker containers."
        print_color $GREEN "Client: http://localhost:3000"
        print_color $GREEN "Server: http://localhost:5000"
        print_color $GREEN "MongoDB: mongodb://localhost:27017"
        print_color $GREEN "Mongo Express: http://localhost:8081"
    else
        npm run dev
    fi
}

# Main setup process
main() {
    print_color $BLUE "Starting HRM System setup..."
    
    check_prerequisites
    setup_env
    install_dependencies
    build_app
    setup_database
    run_app
    
    print_color $GREEN "Setup completed successfully!"
    print_color $BLUE "You can now access the application at http://localhost:3000"
}

# Run main function
main
