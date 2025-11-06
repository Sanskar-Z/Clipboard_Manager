#!/bin/bash

# 🔨 Clipboard Manager Build Script
# This script builds the complete project including native addon and VS Code extension

set -e  # Exit on error

echo "🔨 Building Clipboard Manager..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "binding.gyp" ]; then
    print_error "Error: binding.gyp not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Check for build tools
print_info "Checking for build tools..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js found: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm found: $(npm --version)"

if ! command -v make &> /dev/null; then
    print_error "make is not installed."
    echo "Please install build tools:"
    echo "  Linux: sudo dnf install -y gcc gcc-c++ make python3-devel"
    echo "  macOS: xcode-select --install"
    exit 1
fi
print_success "make found"

if ! command -v g++ &> /dev/null; then
    print_error "g++ is not installed."
    echo "Please install build tools:"
    echo "  Linux: sudo dnf install -y gcc gcc-c++ make python3-devel"
    echo "  macOS: xcode-select --install"
    exit 1
fi
print_success "g++ found: $(g++ --version | head -n1)"

echo ""

# Step 2: Clean previous build
print_info "Cleaning previous build..."
if [ -d "build" ]; then
    rm -rf build
    print_success "Cleaned build directory"
fi

if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "Cleaned node_modules"
fi

echo ""

# Step 3: Install root dependencies and build native addon
print_info "Installing dependencies and building native addon..."
npm install

if [ ! -f "build/Release/clipboard_addon.node" ]; then
    print_error "Native addon build failed!"
    exit 1
fi

print_success "Native addon built successfully"
echo ""

# Step 4: Run tests
print_info "Running tests..."
npm test

if [ $? -ne 0 ]; then
    print_error "Tests failed!"
    exit 1
fi

print_success "All tests passed"
echo ""

# Step 5: Install VS Code extension dependencies
print_info "Installing VS Code extension dependencies..."
cd clipboard-multi

if [ -d "node_modules" ]; then
    rm -rf node_modules
fi

npm install

if [ $? -ne 0 ]; then
    print_error "Extension dependency installation failed!"
    exit 1
fi

print_success "Extension dependencies installed"
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Build completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Next steps:"
echo ""
echo "  1. Open VS Code:"
echo "     code clipboard-multi"
echo ""
echo "  2. Press F5 to launch Extension Development Host"
echo ""
echo "  3. Test the extension in the new VS Code window"
echo ""
echo "  4. Package for distribution (optional):"
echo "     cd clipboard-multi"
echo "     npm install -g @vscode/vsce"
echo "     vsce package"
echo ""
print_success "Happy coding! 🎉"
