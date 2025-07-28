#!/bin/bash

echo "--- Populating the Database with Direct SQLite Insertion ---"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

DB_PATH="backend/database/sqlite.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}Error: Database file $DB_PATH not found!${NC}"
    echo -e "${YELLOW}Please run 'npm run migration:fresh' in the backend directory first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database file found${NC}"
echo ""

echo -e "${GREEN}--- Creating 4 users ---${NC}"
echo ""

# Create User A (Alice)
echo -e "${YELLOW}Creating User A (Alice)${NC}"
USER_A_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO users (id, email, name, username, password_hash, auth_method, avatar_url, created_at, updated_at) VALUES ('$USER_A_ID', 'alice@example.com', 'Alice Johnson', 'alice_j', '!Asdf1asdf', 'password', 'https://example.com/avatar1.jpg', datetime('now'), datetime('now'));"
echo -e "${GREEN}✓ User A created with ID: ${USER_A_ID}${NC}\n"

# Create User B (Bob)
echo -e "${YELLOW}Creating User B (Bob)${NC}"
USER_B_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO users (id, email, name, username, password_hash, auth_method, avatar_url, created_at, updated_at) VALUES ('$USER_B_ID', 'bob@example.com', 'Bob Smith', 'bob_s', '!Asdf1asdf', 'password', 'https://example.com/avatar2.jpg', datetime('now'), datetime('now'));"
echo -e "${GREEN}✓ User B created with ID: ${USER_B_ID}${NC}\n"

# Create User C (Charlie)
echo -e "${YELLOW}Creating User C (Charlie)${NC}"
USER_C_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO users (id, email, name, username, password_hash, auth_method, avatar_url, created_at, updated_at) VALUES ('$USER_C_ID', 'charlie@example.com', 'Charlie Brown', 'charlie_b', '!Asdf1asdf', 'password', 'https://example.com/avatar3.jpg', datetime('now'), datetime('now'));"
echo -e "${GREEN}✓ User C created with ID: ${USER_C_ID}${NC}\n"

# Create User D (Diana)
echo -e "${YELLOW}Creating User D (Diana)${NC}"
USER_D_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO users (id, email, name, username, password_hash, auth_method, avatar_url, created_at, updated_at) VALUES ('$USER_D_ID', 'diana@example.com', 'Diana Prince', 'diana_p', '!Asdf1asdf', 'password', 'https://example.com/avatar4.jpg', datetime('now'), datetime('now'));"
echo -e "${GREEN}✓ User D created with ID: ${USER_D_ID}${NC}\n"

echo -e "${CYAN}Created Users Summary:${NC}"
echo -e "  • User A (Alice): ${USER_A_ID}"
echo -e "  • User B (Bob): ${USER_B_ID}"
echo -e "  • User C (Charlie): ${USER_C_ID}"
echo -e "  • User D (Diana): ${USER_D_ID}"
echo ""

echo -e "${BLUE}Creating Game History Entries and User Stats...${NC}"
echo ""

# Game 1: Alice wins against Bob
echo -e "${YELLOW}Game 1: Alice vs Bob${NC}"
GAME_1_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO game_history (id, winner_id, loser_id, winner_name, loser_name, winner_score, loser_score, local_game, created_at) VALUES ('$GAME_1_ID', '$USER_A_ID', '$USER_B_ID', 'Alice Johnson', 'Bob Smith', 5, 3, 0, datetime('now'));"
echo -e "${GREEN}✓ Game 1 created${NC}"

# Create/update stats for Alice (winner)
ALICE_STATS_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT OR REPLACE INTO user_stats (id, user_id, matches_played, matches_won, matches_lost, win_rate, rating, updated_at) VALUES ('$ALICE_STATS_ID', '$USER_A_ID', 1, 1, 0, 100.0, 110, datetime('now'));"
echo -e "${GREEN}✓ Stats created/updated for Alice (winner)${NC}"

# Create/update stats for Bob (loser)
BOB_STATS_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT OR REPLACE INTO user_stats (id, user_id, matches_played, matches_won, matches_lost, win_rate, rating, updated_at) VALUES ('$BOB_STATS_ID', '$USER_B_ID', 1, 0, 1, 0.0, 90, datetime('now'));"
echo -e "${GREEN}✓ Stats created/updated for Bob (loser)${NC}"
echo -e "${GREEN}✓ Ratings updated for Game 1${NC}\n"

# Game 2: Charlie wins against Alice
echo -e "${YELLOW}Game 2: Charlie vs Alice${NC}"
GAME_2_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO game_history (id, winner_id, loser_id, winner_name, loser_name, winner_score, loser_score, local_game, created_at) VALUES ('$GAME_2_ID', '$USER_C_ID', '$USER_A_ID', 'Charlie Brown', 'Alice Johnson', 5, 2, 0, datetime('now'));"
echo -e "${GREEN}✓ Game 2 created${NC}"

# Create/update stats for Charlie (winner)
CHARLIE_STATS_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT OR REPLACE INTO user_stats (id, user_id, matches_played, matches_won, matches_lost, win_rate, rating, updated_at) VALUES ('$CHARLIE_STATS_ID', '$USER_C_ID', 1, 1, 0, 100.0, 115, datetime('now'));"
echo -e "${GREEN}✓ Stats created/updated for Charlie (winner)${NC}"

# Update stats for Alice (loser)
sqlite3 $DB_PATH "UPDATE user_stats SET matches_played = 2, matches_lost = 1, win_rate = 50.0, rating = 105, updated_at = datetime('now') WHERE user_id = '$USER_A_ID';"
echo -e "${GREEN}✓ Stats updated for Alice (loser)${NC}"
echo -e "${GREEN}✓ Ratings updated for Game 2${NC}\n"

# Game 3: Bob wins against Diana
echo -e "${YELLOW}Game 3: Bob vs Diana${NC}"
GAME_3_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO game_history (id, winner_id, loser_id, winner_name, loser_name, winner_score, loser_score, local_game, created_at) VALUES ('$GAME_3_ID', '$USER_B_ID', '$USER_D_ID', 'Bob Smith', 'Diana Prince', 5, 4, 0, datetime('now'));"
echo -e "${GREEN}✓ Game 3 created${NC}"

# Update stats for Bob (winner)
sqlite3 $DB_PATH "UPDATE user_stats SET matches_played = 2, matches_won = 1, win_rate = 50.0, rating = 105, updated_at = datetime('now') WHERE user_id = '$USER_B_ID';"
echo -e "${GREEN}✓ Stats updated for Bob (winner)${NC}"

# Create/update stats for Diana (loser)
DIANA_STATS_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT OR REPLACE INTO user_stats (id, user_id, matches_played, matches_won, matches_lost, win_rate, rating, updated_at) VALUES ('$DIANA_STATS_ID', '$USER_D_ID', 1, 0, 1, 0.0, 85, datetime('now'));"
echo -e "${GREEN}✓ Stats created/updated for Diana (loser)${NC}"
echo -e "${GREEN}✓ Ratings updated for Game 3${NC}\n"

# Game 4: Alice wins against Diana
echo -e "${YELLOW}Game 4: Alice vs Diana${NC}"
GAME_4_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO game_history (id, winner_id, loser_id, winner_name, loser_name, winner_score, loser_score, local_game, created_at) VALUES ('$GAME_4_ID', '$USER_A_ID', '$USER_D_ID', 'Alice Johnson', 'Diana Prince', 5, 1, 0, datetime('now'));"
echo -e "${GREEN}✓ Game 4 created${NC}"

# Update stats for Alice (winner)
sqlite3 $DB_PATH "UPDATE user_stats SET matches_played = 3, matches_won = 2, win_rate = 66.7, rating = 115, updated_at = datetime('now') WHERE user_id = '$USER_A_ID';"
echo -e "${GREEN}✓ Stats updated for Alice (winner)${NC}"

# Update stats for Diana (loser)
sqlite3 $DB_PATH "UPDATE user_stats SET matches_played = 2, matches_lost = 2, win_rate = 0.0, rating = 75, updated_at = datetime('now') WHERE user_id = '$USER_D_ID';"
echo -e "${GREEN}✓ Stats updated for Diana (loser)${NC}"
echo -e "${GREEN}✓ Ratings updated for Game 4${NC}\n"

echo -e "${BLUE}Creating Tournament Entries ...${NC}"
echo ""

# Create Tournament 1 (Direct SQLite insertion)
echo -e "${YELLOW}Creating Tournament 1 (Alice as creator)${NC}"
TOURNAMENT_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO tournament (id, name, creator, players, tournament_status, tournament_size, number_of_rounds, bracket, created_at, updated_at) VALUES ('$TOURNAMENT_ID', 'First Tournament', '$USER_A_ID', json_array('$USER_A_ID'), 'OPEN', 4, 0, NULL, datetime('now'), datetime('now'));"
echo -e "${GREEN}✓ Tournament created with ID: ${TOURNAMENT_ID}${NC}\n"

echo -e "${YELLOW} Bob joining Tournament 1 (Alice as creator)${NC}"
sqlite3 $DB_PATH "UPDATE tournament SET players = json_insert(players, '$[#]', '$USER_B_ID') WHERE id = '$TOURNAMENT_ID';"
echo -e "${GREEN}✓ Bob joined tournament${NC}\n"

echo -e "${BLUE}Creating Friend Requests and Friendships...${NC}"
echo ""

# Database path
DB_PATH="backend/database/sqlite.db"

# Bob sends friend request to Charlie (Direct SQLite insertion)
echo -e "${YELLOW}Bob sending friend request to Charlie${NC}"
BOB_REQUEST_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO friend_request (id, requester_id, addressee_id, status, created_at) VALUES ('$BOB_REQUEST_ID', '$USER_B_ID', '$USER_C_ID', 'pending', datetime('now'));"
echo -e "${GREEN}✓ Bob sent friend request to Charlie${NC}\n"

# Diana sends friend request to Charlie (Direct SQLite insertion)
echo -e "${YELLOW}Diana sending friend request to Charlie${NC}"
DIANA_REQUEST_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO friend_request (id, requester_id, addressee_id, status, created_at) VALUES ('$DIANA_REQUEST_ID', '$USER_D_ID', '$USER_C_ID', 'pending', datetime('now'));"
echo -e "${GREEN}✓ Diana sent friend request to Charlie${NC}\n"

# Charlie accepts Diana's friend request (Update status and create friendships)
echo -e "${YELLOW}Charlie accepting Diana's friend request${NC}"
# Update the friend request status
sqlite3 $DB_PATH "UPDATE friend_request SET status = 'accepted', accepted_at = datetime('now') WHERE id = '$DIANA_REQUEST_ID';"

# Create bidirectional friendship entries
FRIENDSHIP_ID_1=$(uuidgen)
FRIENDSHIP_ID_2=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO friendship (id, user_id, friend_id, status, created_at) VALUES ('$FRIENDSHIP_ID_1', '$USER_C_ID', '$USER_D_ID', 'active', datetime('now'));"
sqlite3 $DB_PATH "INSERT INTO friendship (id, user_id, friend_id, status, created_at) VALUES ('$FRIENDSHIP_ID_2', '$USER_D_ID', '$USER_C_ID', 'active', datetime('now'));"
echo -e "${GREEN}✓ Charlie accepted Diana's friend request${NC}\n"

echo -e "${BLUE}Creating Chat Rooms...${NC}"
echo ""

# Create a general chat room with Alice as master
echo -e "${YELLOW}Creating General Chat Room (Alice as master)${NC}"
ROOM_ID=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO room (id, name, master_id, description, is_private, max_users, created_at, updated_at) VALUES ('$ROOM_ID', 'General Chat', '$USER_A_ID', 'Welcome to the general chat room!', 0, 50, datetime('now'), datetime('now'));"

# Add Alice as the first member of the room
ROOM_MEMBER_ID_1=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO room_member (id, user_id, name, joined_at, room_id) VALUES ('$ROOM_MEMBER_ID_1', '$USER_A_ID', 'Alice Johnson', datetime('now'), '$ROOM_ID');"

# Add Bob to the room
ROOM_MEMBER_ID_2=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO room_member (id, user_id, name, joined_at, room_id) VALUES ('$ROOM_MEMBER_ID_2', '$USER_B_ID', 'Bob Smith', datetime('now'), '$ROOM_ID');"

# Add Charlie to the room
ROOM_MEMBER_ID_3=$(uuidgen)
sqlite3 $DB_PATH "INSERT INTO room_member (id, user_id, name, joined_at, room_id) VALUES ('$ROOM_MEMBER_ID_3', '$USER_C_ID', 'Charlie Brown', datetime('now'), '$ROOM_ID');"

echo -e "${GREEN}✓ General Chat Room created with 3 members${NC}\n"

echo -e "${PURPLE}--- Database Population Complete! ---${NC}"
echo -e "${CYAN}Summary:${NC}"
echo -e "  • Created 4 users"
echo -e "  • Created 4 game history entries"
echo -e "  • Created/updated user stats after each game"
echo -e "  • Updated user ratings after each game"
echo -e "  • Created 1 tournament"
echo -e "  • Created friend requests and friendships:"
echo -e "    - Bob sent friend request to Charlie (pending)"
echo -e "    - Diana sent friend request to Charlie (accepted)"
echo -e "    - Charlie and Diana are now friends"
echo -e "  • Created 1 chat room:"
echo -e "    - General Chat Room with Alice, Bob, and Charlie"
echo -e "  • Final results:"
echo -e "    - Alice (alice_j): ${USER_A_ID} (2 wins, 1 loss)"
echo -e "    - Bob (bob_s): ${USER_B_ID} (1 win, 1 loss)"
echo -e "    - Charlie (charlie_b): ${USER_C_ID} (1 win, 0 losses)"
echo -e "    - Diana (diana_p): ${USER_D_ID} (0 wins, 2 losses)"
echo -e "    - Tournament ID: ${TOURNAMENT_ID}"
echo -e "    - Room ID: ${ROOM_ID}"
echo ""
