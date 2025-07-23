#!/bin/bash

echo "--- Populating the Database ---"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="http://localhost:3000/api"

echo -e "${GREEN}--- Creating 4 users ---${NC}"
echo ""

# Create User A
echo -e "${YELLOW}Creating User A (Alice)${NC}"
curl -s -X POST "${BASE_URL}/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "username": "alice_j",
    "password": "password123",
    "authMethod": "password",
    "avatarUrl": "https://example.com/avatar1.jpg"
  }' > /dev/null
USER_A_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/alice_j")
USER_A_ID=$(echo $USER_A_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ User A created with ID: ${USER_A_ID}${NC}\n"

# Create User B
echo -e "${YELLOW}Creating User B (Bob)${NC}"
curl -s -X POST "${BASE_URL}/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "name": "Bob Smith",
    "username": "bob_s",
    "password": "password123",
    "authMethod": "password",
    "avatarUrl": "https://example.com/avatar2.jpg"
  }' > /dev/null
USER_B_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/bob_s")
USER_B_ID=$(echo $USER_B_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ User B created with ID: ${USER_B_ID}${NC}\n"

# Create User C
echo -e "${YELLOW}Creating User C (Charlie)${NC}"
curl -s -X POST "${BASE_URL}/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "charlie@example.com",
    "name": "Charlie Brown",
    "username": "charlie_b",
    "password": "password123",
    "authMethod": "password",
    "avatarUrl": "https://example.com/avatar3.jpg"
  }' > /dev/null
USER_C_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/charlie_b")
USER_C_ID=$(echo $USER_C_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ User C created with ID: ${USER_C_ID}${NC}\n"

# Create User D
echo -e "${YELLOW}Creating User D (Diana)${NC}"
curl -s -X POST "${BASE_URL}/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "diana@example.com",
    "name": "Diana Prince",
    "username": "diana_p",
    "password": "password123",
    "authMethod": "password",
    "avatarUrl": "https://example.com/avatar4.jpg"
  }' > /dev/null
USER_D_RESPONSE=$(curl -s -X GET "${BASE_URL}/users/diana_p")
USER_D_ID=$(echo $USER_D_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ User D created with ID: ${USER_D_ID}${NC}\n"

echo -e "${CYAN}Created Users Summary:${NC}"
echo -e "  • User A (Alice): ${USER_A_ID}"
echo -e "  • User B (Bob): ${USER_B_ID}"
echo -e "  • User C (Charlie): ${USER_C_ID}"
echo -e "  • User D (Diana): ${USER_D_ID}"
echo ""

echo -e "${BLUE}Creating Game History Entries and User Stats...${NC}"
echo ""

# Game 1: User A wins against User B
echo -e "${YELLOW}Game 1: Alice vs Bob${NC}"
curl -X POST "${BASE_URL}/history/" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_A_ID}\",
    \"loserId\": \"${USER_B_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 3,
    \"local\": false
  }"
echo -e "\n${GREEN}✓ Game 1 created${NC}"

# Create/update stats for Alice (winner)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_A_ID}\",
    \"won\": true
  }" > /dev/null
echo -e "${GREEN}✓ Stats created/updated for Alice (winner)${NC}"

# Create/update stats for Bob (loser)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_B_ID}\",
    \"won\": false
  }" > /dev/null
echo -e "${GREEN}✓ Stats created/updated for Bob (loser)${NC}"

# Update ratings for Game 1
curl -s -X POST "${BASE_URL}/stats/update-rating" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_A_ID}\",
    \"loserId\": \"${USER_B_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 3
  }" > /dev/null
echo -e "${GREEN}✓ Ratings updated for Game 1${NC}\n"

# Game 2: User C wins against User A
echo -e "${YELLOW}Game 2: Charlie vs Alice${NC}"
curl -X POST "${BASE_URL}/history/" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_C_ID}\",
    \"loserId\": \"${USER_A_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 2,
    \"local\": false
  }"
echo -e "\n${GREEN}✓ Game 2 created${NC}"

# Create/update stats for Charlie (winner)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_C_ID}\",
    \"won\": true
  }" > /dev/null
echo -e "${GREEN}✓ Stats created/updated for Charlie (winner)${NC}"

# Update stats for Alice (loser)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_A_ID}\",
    \"won\": false
  }" > /dev/null
echo -e "${GREEN}✓ Stats updated for Alice (loser)${NC}"

# Update ratings for Game 2
curl -s -X POST "${BASE_URL}/stats/update-rating" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_C_ID}\",
    \"loserId\": \"${USER_A_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 2
  }" > /dev/null
echo -e "${GREEN}✓ Ratings updated for Game 2${NC}\n"

# Game 3: User B wins against User D
echo -e "${YELLOW}Game 3: Bob vs Diana${NC}"
curl -X POST "${BASE_URL}/history/" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_B_ID}\",
    \"loserId\": \"${USER_D_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 4,
    \"local\": false
  }"
echo -e "\n${GREEN}✓ Game 3 created${NC}"

# Update stats for Bob (winner)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_B_ID}\",
    \"won\": true
  }" > /dev/null
echo -e "${GREEN}✓ Stats updated for Bob (winner)${NC}"

# Create/update stats for Diana (loser)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_D_ID}\",
    \"won\": false
  }" > /dev/null
echo -e "${GREEN}✓ Stats created/updated for Diana (loser)${NC}"

# Update ratings for Game 3
curl -s -X POST "${BASE_URL}/stats/update-rating" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_B_ID}\",
    \"loserId\": \"${USER_D_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 4
  }" > /dev/null
echo -e "${GREEN}✓ Ratings updated for Game 3${NC}\n"

# Game 4: User A wins against User D
echo -e "${YELLOW}Game 4: Alice vs Diana${NC}"
curl -X POST "${BASE_URL}/history/" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_A_ID}\",
    \"loserId\": \"${USER_D_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 1,
    \"local\": false
  }"
echo -e "\n${GREEN}✓ Game 4 created${NC}"

# Update stats for Alice (winner)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_A_ID}\",
    \"won\": true
  }" > /dev/null
echo -e "${GREEN}✓ Stats updated for Alice (winner)${NC}"

# Update stats for Diana (loser)
curl -s -X POST "${BASE_URL}/stats/users/" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_D_ID}\",
    \"won\": false
  }" > /dev/null
echo -e "${GREEN}✓ Stats updated for Diana (loser)${NC}"

# Update ratings for Game 4
curl -s -X POST "${BASE_URL}/stats/update-rating" \
  -H "Content-Type: application/json" \
  -d "{
    \"winnerId\": \"${USER_A_ID}\",
    \"loserId\": \"${USER_D_ID}\",
    \"winnerScore\": 5,
    \"loserScore\": 1
  }" > /dev/null
echo -e "${GREEN}✓ Ratings updated for Game 4${NC}\n"

echo -e "${PURPLE}--- Database Population Complete! ---${NC}"
echo -e "${CYAN}Summary:${NC}"
echo -e "  • Created 4 users"
echo -e "  • Created 4 game history entries"
echo -e "  • Created/updated user stats after each game"
echo -e "  • Updated user ratings after each game"
echo -e "  • Final results:"
echo -e "    - Alice (alice_j): ${USER_A_ID} (2 wins, 1 loss)"
echo -e "    - Bob (bob_s): ${USER_B_ID} (1 win, 1 loss)"
echo -e "    - Charlie (charlie_b): ${USER_C_ID} (1 win, 0 losses)"
echo -e "    - Diana (diana_p): ${USER_D_ID} (0 wins, 2 losses)"
echo ""
