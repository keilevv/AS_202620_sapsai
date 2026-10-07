#!/bin/bash

# Development run script for Leaf Classifier Application (Windows Bash)
# This script starts all three services: classifier, frontend, and backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "Shutting down services..."
    
    # Kill all background processes
    if [ ! -z "$CLASSIFIER_PID" ]; then
        kill $CLASSIFIER_PID 2>/dev/null || true
        print_status "Classifier service stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend service stopped"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend service stopped"
    fi
    
    print_success "All services stopped"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Check if required directories exist
if [ ! -d "classifier" ]; then
    print_error "Classifier directory not found"
    exit 1
fi

if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found"
    exit 1
fi

if [ ! -d "backend" ]; then
    print_error "Backend directory not found"
    exit 1
fi

print_status "Starting Leaf Classifier Development Environment..."

# Start Classifier Service (Flask)
print_status "Starting Classifier Service..."
cd classifier

# Check if virtual environment exists
if [ ! -d "env" ]; then
    print_error "Virtual environment not found in classifier directory"
    print_warning "Please create a virtual environment first:"
    print_warning "cd classifier && python -m venv env && env/Scripts/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment and start Flask app (Windows-compatible)
# Use the Windows Scripts/activate.bat or Scripts/activate for bash
if [ -f "env/Scripts/activate" ]; then
    source env/Scripts/activate
elif [ -f "env/Scripts/activate.bat" ]; then
    # For Windows bash, we need to use the .bat file
    print_warning "Using Windows batch activation - this may not work in all bash environments"
    print_warning "Consider using WSL or Git Bash for better compatibility"
    source env/Scripts/activate.bat
else
    print_error "Virtual environment activation script not found"
    print_warning "Expected: env/Scripts/activate or env/Scripts/activate.bat"
    exit 1
fi

python app.py &
CLASSIFIER_PID=$!
cd ..

print_success "Classifier service started (PID: $CLASSIFIER_PID)"

# Start Backend Service
print_status "Starting Backend Service..."
cd backend
bun run dev &
BACKEND_PID=$!
cd ..

print_success "Backend service started (PID: $BACKEND_PID)"

# Start Frontend Service
print_status "Starting Frontend Service..."
cd frontend
bun run dev &
FRONTEND_PID=$!
cd ..

print_success "Frontend service started (PID: $FRONTEND_PID)"

print_success "All services started successfully!"
echo ""
print_status "Services are running on:"
print_status "  - Classifier: http://localhost:5000"
print_status "  - Backend: Check the backend output for the port"
print_status "  - Frontend: Check the frontend output for the port"
echo ""
print_status "Press Ctrl+C to stop all services"

# Wait for all background processes
wait

