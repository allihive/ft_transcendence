#!/bin/bash

echo "=== 🧹 Full Database Reset Script ==="

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⚠️  This will DELETE all database content permanently.${NC}"
echo -e "${YELLOW}Are you sure you want to continue? Type 'yes' to proceed:${NC}"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo -e "\n${BLUE}1. Stopping backend processes...${NC}"
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "node.*main" 2>/dev/null || true
sleep 2

echo -e "\n${BLUE}2. Navigating to backend folder...${NC}"
cd backend || { echo "❌ backend directory not found"; exit 1; }

echo -e "\n${BLUE}3. Deleting all SQLite database files...${NC}"
find . -type f -name "*.db" -exec rm -v {} \;
find ./temp -type f -name "*.db" -exec rm -v {} \; 2>/dev/null || true

echo -e "\n${BLUE}4. Reinstalling dependencies (optional)...${NC}"
npm install

echo -e "\n${BLUE}5. Running full database migration reset...${NC}"
npx mikro-orm migration:fresh
npx mikro-orm migration:up

echo -e "\n${GREEN}✅ Database has been reset successfully!${NC}"
echo -e "${YELLOW}Now restart the backend server manually:${NC}"
echo -e "${BLUE}cd backend && npm run dev${NC}"

cd ..
