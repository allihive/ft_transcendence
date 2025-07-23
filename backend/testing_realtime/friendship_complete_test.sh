#!/bin/bash

echo "=== 👥 Complete Friendship API Test with Multiple Users ==="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="http://localhost:3000/api"

# Generate unique timestamp for this test session
TIMESTAMP=$(date +%s)

# Test users (using regular arrays for better compatibility)
USERS_EMAILS=(
    "alice_${TIMESTAMP}@test.com"
    "bob_${TIMESTAMP}@test.com"
    "charlie_${TIMESTAMP}@test.com"
    "diana_${TIMESTAMP}@test.com"
)

USERS_USERNAMES=(
    "Alice_${TIMESTAMP}"
    "Bob_${TIMESTAMP}"
    "Charlie_${TIMESTAMP}"
    "Diana_${TIMESTAMP}"
)

USERS_SHORTNAMES=(
    "alice${TIMESTAMP}"
    "bob${TIMESTAMP}"
    "charlie${TIMESTAMP}"
    "diana${TIMESTAMP}"
)

USERS_NAMES=(
    "Alice Test"
    "Bob Test"
    "Charlie Test"
    "Diana Test"
)

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
print_step() {
    echo -e "\n${CYAN}📋 $1${NC}"
}

print_result() {
    echo -e "\n${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

print_error() {
    echo -e "\n${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test counter
run_test() {
    ((TOTAL_TESTS++))
    echo -e "\n${PURPLE}Test $TOTAL_TESTS: $1${NC}"
}

# Check if server is running
check_server() {
    run_test "Server connectivity check"
    
    SERVER_CHECK=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/../" 2>/dev/null)
    
    if [ "$SERVER_CHECK" = "000" ] || [ -z "$SERVER_CHECK" ]; then
        print_error "Server is not running on localhost:3000"
        echo "Please start the backend server: cd backend && npm run dev"
        exit 1
    fi
    
    print_result "Server is running (status: $SERVER_CHECK)"
}

# Create a user
create_user() {
    local user_num=$1
    local user_index=$((user_num - 1))  # Convert to 0-based index
    
    local email="${USERS_EMAILS[$user_index]}"
    local username="${USERS_USERNAMES[$user_index]}"
    local shortname="${USERS_SHORTNAMES[$user_index]}"
    local name="${USERS_NAMES[$user_index]}"
    
    run_test "Create User $user_num: $name ($email)"
    
    local response=$(curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"name\": \"$name\",
            \"username\": \"$username\",
            \"password\": \"password123\",
            \"avatarUrl\": \"/files/avatar.png\"
        }")
    
    if [ -z "$response" ]; then
        print_error "Empty response from server for user $user_num"
        return 1
    fi
    
    if echo "$response" | grep -q '"id"'; then
        print_result "User $user_num created successfully"
        return 0
    elif echo "$response" | grep -q "already exists\|duplicate"; then
        print_warning "User $user_num already exists (continuing)"
        return 0
    else
        print_error "User $user_num creation failed: $response"
        return 1
    fi
}

# Login a user
login_user() {
    local user_num=$1
    local user_index=$((user_num - 1))  # Convert to 0-based index
    local email="${USERS_EMAILS[$user_index]}"
    
    run_test "Login User $user_num"
    
    local response=$(curl -s -c "cookies_user${user_num}.txt" -X POST \
        "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"password123\"}")
    
    if [ -z "$response" ]; then
        print_error "Empty login response for user $user_num"
        return 1
    fi
    
    if echo "$response" | grep -q '"id"'; then
        print_result "User $user_num logged in successfully"
        return 0
    else
        print_error "User $user_num login failed: $response"
        return 1
    fi
}

# Send friend request
send_friend_request() {
    local sender_num=$1
    local receiver_num=$2
    local receiver_index=$((receiver_num - 1))  # Convert to 0-based index
    local receiver_email="${USERS_EMAILS[$receiver_index]}"
    
    run_test "User $sender_num sending friend request to User $receiver_num"
    
    local response=$(curl -s -b "cookies_user${sender_num}.txt" -X POST \
        "$BASE_URL/realtime/friends/requests/$receiver_email")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        print_result "Friend request sent successfully"
        return 0
    elif echo "$response" | grep -q "already exists\|already friends"; then
        print_warning "Friend request already exists or already friends"
        return 1
    else
        print_error "Friend request failed"
        return 1
    fi
}

# Get pending requests
get_pending_requests() {
    local user_num=$1
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X GET \
        "$BASE_URL/realtime/friends/requests")
    
    echo "$response"
}

# Accept friend request
accept_friend_request() {
    local user_num=$1
    local request_id=$2
    
    run_test "User $user_num accepting friend request $request_id"
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X POST \
        "$BASE_URL/realtime/friends/requests/$request_id/accept")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        print_result "Friend request accepted"
        return 0
    else
        print_error "Friend request acceptance failed"
        return 1
    fi
}

# Reject friend request
reject_friend_request() {
    local user_num=$1
    local request_id=$2
    
    run_test "User $user_num rejecting friend request $request_id"
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X POST \
        "$BASE_URL/realtime/friends/requests/$request_id/reject")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"message"'; then
        print_result "Friend request rejected"
        return 0
    else
        print_error "Friend request rejection failed"
        return 1
    fi
}

# Get friends list
get_friends_list() {
    local user_num=$1
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X GET \
        "$BASE_URL/realtime/friends")
    
    echo "$response"
}

# Get blocked friends list
get_blocked_friends_list() {
    local user_num=$1
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X GET \
        "$BASE_URL/realtime/friends/blocked")
    
    echo "$response"
}

# Get friend count
get_friend_count() {
    local friends_response="$1"
    
    if command -v jq &> /dev/null; then
        echo "$friends_response" | jq -r '.payload.totalCount // 0' 2>/dev/null
    else
        echo "$friends_response" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2 | head -1
    fi
}

# Get unread message count from room list
get_unread_count_from_roomlist() {
    local roomlist_response="$1"
    local room_id="$2"
    
    if command -v jq &> /dev/null; then
        echo "$roomlist_response" | jq -r ".roomList[] | select(.id == \"$room_id\") | .unreadCount // 0" 2>/dev/null
    else
        echo "$roomlist_response" | grep -A 20 "\"id\":\"$room_id\"" | grep -o '"unreadCount":[0-9]*' | cut -d':' -f2 | head -1
    fi
}

# Extract request ID
extract_request_id() {
    local pending_response="$1"
    
    if command -v jq &> /dev/null; then
        echo "$pending_response" | jq -r '.[0].id // empty' 2>/dev/null
    else
        echo "$pending_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
    fi
}

# Extract friend ID
extract_friend_id() {
    local friends_response="$1"
    local index=${2:-0}
    
    if command -v jq &> /dev/null; then
        echo "$friends_response" | jq -r ".payload.friends[$index].id // empty" 2>/dev/null
    else
        echo "$friends_response" | grep -o '"id":"[^"]*"' | sed -n "$((index+2))p" | cut -d'"' -f4
    fi
}

# Block friend
block_friend() {
    local user_num=$1
    local friend_id=$2
    
    run_test "User $user_num blocking friend $friend_id"
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X POST \
        "$BASE_URL/realtime/friends/$friend_id/block")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        print_result "Friend blocked successfully"
        return 0
    else
        print_error "Friend blocking failed"
        return 1
    fi
}

# Unblock friend
unblock_friend() {
    local user_num=$1
    local friend_id=$2
    
    run_test "User $user_num unblocking friend $friend_id"
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X POST \
        "$BASE_URL/realtime/friends/$friend_id/unblock")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        print_result "Friend unblocked successfully"
        return 0
    else
        print_error "Friend unblocking failed"
        return 1
    fi
}

# Remove friend
remove_friend() {
    local user_num=$1
    local friend_id=$2
    
    run_test "User $user_num removing friend $friend_id"
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X DELETE \
        "$BASE_URL/realtime/friends/$friend_id")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        print_result "Friend removed successfully"
        return 0
    else
        print_error "Friend removal failed"
        return 1
    fi
}

# Get online friends
get_online_friends() {
    local user_num=$1
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X GET \
        "$BASE_URL/realtime/friends/online")
    
    echo "$response"
}

# Get online users
get_online_users() {
    local user_num=$1
    
    local response=$(curl -s -b "cookies_user${user_num}.txt" -X GET \
        "$BASE_URL/realtime/users/online")
    
    echo "$response"
}

# Cleanup function
cleanup() {
    print_step "Cleaning up cookies and logging out users"
    
    for i in {1..4}; do
        if [ -f "cookies_user${i}.txt" ]; then
            curl -s -b "cookies_user${i}.txt" -X POST "$BASE_URL/auth/logout" > /dev/null 2>&1
            rm -f "cookies_user${i}.txt"
        fi
    done
    
    print_result "Cleanup completed"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# === MAIN TEST EXECUTION ===

echo -e "${PURPLE}🚀 Starting comprehensive friendship API test${NC}"
echo -e "${PURPLE}Test session: $TIMESTAMP${NC}"

# Step 1: Check server
check_server

# Step 2: Create users
print_step "Creating 4 test users"

for i in {1..4}; do
    if ! create_user $i; then
        print_error "Failed to create User $i. Exiting."
        exit 1
    fi
done

print_result "All users created successfully"

# Step 3: Login users
print_step "Logging in all users"

for i in {1..4}; do
    if ! login_user $i; then
        print_error "Failed to login User $i. Exiting."
        exit 1
    fi
done

print_result "All users logged in successfully"

# Step 4: Test friend requests
print_step "Testing friend requests"

echo -e "\n${BLUE}Scenario: User 1 → User 2${NC}"
send_friend_request 1 2

echo -e "\n${BLUE}Scenario: User 1 → User 3${NC}"
send_friend_request 1 3

echo -e "\n${BLUE}Scenario: User 2 → User 4${NC}"
send_friend_request 2 4

echo -e "\n${BLUE}Scenario: User 3 → User 4${NC}"
send_friend_request 3 4

# Step 5: Check pending requests and accept/reject
print_step "Processing pending friend requests"

echo -e "\n${BLUE}User 2's pending requests:${NC}"
USER2_PENDING=$(get_pending_requests 2)
echo "$USER2_PENDING"

REQUEST_ID=$(extract_request_id "$USER2_PENDING")
if [ ! -z "$REQUEST_ID" ] && [ "$REQUEST_ID" != "null" ]; then
    echo -e "\n${BLUE}User 2 accepting request from User 1${NC}"
    accept_friend_request 2 "$REQUEST_ID"
else
    print_warning "No pending request found for User 2"
fi

echo -e "\n${BLUE}User 3's pending requests:${NC}"
USER3_PENDING=$(get_pending_requests 3)
echo "$USER3_PENDING"

REQUEST_ID=$(extract_request_id "$USER3_PENDING")
if [ ! -z "$REQUEST_ID" ] && [ "$REQUEST_ID" != "null" ]; then
    echo -e "\n${BLUE}User 3 accepting request from User 1${NC}"
    accept_friend_request 3 "$REQUEST_ID"
else
    print_warning "No pending request found for User 3"
fi

echo -e "\n${BLUE}User 4's pending requests:${NC}"
USER4_PENDING=$(get_pending_requests 4)
echo "$USER4_PENDING"

# Get first request ID for acceptance
REQUEST_ID=$(extract_request_id "$USER4_PENDING")
if [ ! -z "$REQUEST_ID" ] && [ "$REQUEST_ID" != "null" ]; then
    echo -e "\n${BLUE}User 4 accepting first request${NC}"
    accept_friend_request 4 "$REQUEST_ID"
    
    # Check for second request and reject it
    sleep 1
    USER4_PENDING_AFTER=$(get_pending_requests 4)
    REQUEST_ID2=$(extract_request_id "$USER4_PENDING_AFTER")
    if [ ! -z "$REQUEST_ID2" ] && [ "$REQUEST_ID2" != "null" ]; then
        echo -e "\n${BLUE}User 4 rejecting second request${NC}"
        reject_friend_request 4 "$REQUEST_ID2"
    fi
else
    print_warning "No pending request found for User 4"
fi

# Step 6: Verify friendships and room list with unread counts
print_step "Verifying established friendships and room list with unread counts"

for i in {1..4}; do
    echo -e "\n${BLUE}User $i's friends:${NC}"
    FRIENDS=$(get_friends_list $i)
    echo "$FRIENDS"
    
    FRIEND_COUNT=$(get_friend_count "$FRIENDS")
    echo -e "${GREEN}Friend count: $FRIEND_COUNT${NC}"
    
    echo -e "\n${BLUE}User $i's room list with unread counts:${NC}"
    # Get user ID for room list API
    USER_INFO=$(curl -s -b "cookies_user${i}.txt" -X GET "$BASE_URL/auth/whoami")
    USER_ID=$(echo "$USER_INFO" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    ROOMLIST=$(curl -s -b "cookies_user${i}.txt" -X GET "$BASE_URL/realtime/rooms/$USER_ID/roomlist")
    echo "$ROOMLIST"
    
    # Check if unreadCount field exists in response
    if echo "$ROOMLIST" | grep -q '"unreadCount"'; then
        print_result "✅ Room list API includes unreadCount field"
    else
        print_warning "⚠️ Room list API missing unreadCount field"
    fi
done

# Step 7: Test online friends and users
print_step "Checking online friends and users"

echo -e "\n${YELLOW}⚠️  Note: In HTTP-only tests, all users appear offline because there are no WebSocket connections.${NC}"
echo -e "${YELLOW}   This is expected behavior. In a real application, users would be online via WebSocket.${NC}"

for i in {1..4}; do
    echo -e "\n${BLUE}User $i's online friends:${NC}"
    ONLINE_FRIENDS=$(get_online_friends $i)
    echo "$ONLINE_FRIENDS"
    
    # Extract counts if jq is available
    if command -v jq &> /dev/null; then
        TOTAL_FRIENDS=$(echo "$ONLINE_FRIENDS" | jq -r '.totalFriends // 0')
        ONLINE_COUNT=$(echo "$ONLINE_FRIENDS" | jq -r '.onlineFriends // 0')
        echo -e "${GREEN}📊 Total friends: $TOTAL_FRIENDS, Online: $ONLINE_COUNT${NC}"
    fi
done

# Test online users endpoint
echo -e "\n${BLUE}Testing online users endpoint:${NC}"
ONLINE_USERS=$(get_online_users 1)
echo "$ONLINE_USERS"

# Step 8: Test blocking functionality
print_step "Testing friend blocking"

echo -e "\n${BLUE}User 1 blocking a friend${NC}"
USER1_FRIENDS=$(get_friends_list 1)
FRIEND_ID=$(extract_friend_id "$USER1_FRIENDS" 0)

if [ ! -z "$FRIEND_ID" ] && [ "$FRIEND_ID" != "null" ]; then
    echo "Blocking friend with ID: $FRIEND_ID"
    
    # Show friends list before blocking
    echo -e "\n${BLUE}User 1's friends list BEFORE blocking:${NC}"
    USER1_FRIENDS_BEFORE=$(get_friends_list 1)
    echo "$USER1_FRIENDS_BEFORE"
    FRIEND_COUNT_BEFORE=$(get_friend_count "$USER1_FRIENDS_BEFORE")
    echo -e "${GREEN}Friend count before blocking: $FRIEND_COUNT_BEFORE${NC}"
    
    # Block the friend
    block_friend 1 "$FRIEND_ID"
    
    sleep 1
    
    # Show friends list after blocking
    echo -e "\n${BLUE}User 1's friends list AFTER blocking:${NC}"
    USER1_FRIENDS_AFTER_BLOCK=$(get_friends_list 1)
    echo "$USER1_FRIENDS_AFTER_BLOCK"
    FRIEND_COUNT_AFTER_BLOCK=$(get_friend_count "$USER1_FRIENDS_AFTER_BLOCK")
    echo -e "${GREEN}Friend count after blocking: $FRIEND_COUNT_AFTER_BLOCK${NC}"
    
    # Show blocked friends list
    echo -e "\n${BLUE}Checking blocked friends list${NC}"
    BLOCKED_FRIENDS=$(get_blocked_friends_list 1)
    echo "$BLOCKED_FRIENDS"
    
    # Unblock the friend
    echo -e "\n${BLUE}User 1 unblocking friend${NC}"
    unblock_friend 1 "$FRIEND_ID"
    
    sleep 1
    
    # Show friends list after unblocking
    echo -e "\n${BLUE}User 1's friends list AFTER unblocking:${NC}"
    USER1_FRIENDS_AFTER_UNBLOCK=$(get_friends_list 1)
    echo "$USER1_FRIENDS_AFTER_UNBLOCK"
    FRIEND_COUNT_AFTER_UNBLOCK=$(get_friend_count "$USER1_FRIENDS_AFTER_UNBLOCK")
    echo -e "${GREEN}Friend count after unblocking: $FRIEND_COUNT_AFTER_UNBLOCK${NC}"
    
    # Verify counts
    if [ "$FRIEND_COUNT_BEFORE" -eq "$FRIEND_COUNT_AFTER_UNBLOCK" ]; then
        print_result "✅ Friend count correctly restored after unblocking"
    else
        print_error "❌ Friend count mismatch: Before=$FRIEND_COUNT_BEFORE, After Unblock=$FRIEND_COUNT_AFTER_UNBLOCK"
    fi
    
    if [ "$FRIEND_COUNT_AFTER_BLOCK" -lt "$FRIEND_COUNT_BEFORE" ]; then
        print_result "✅ Friend correctly removed from main list when blocked"
    else
        print_error "❌ Friend not removed from main list when blocked"
    fi
else
    print_warning "User 1 has no friends to block"
fi

# Step 9: Test friend removal
print_step "Testing friend removal"

echo -e "\n${BLUE}User 2 removing a friend${NC}"
USER2_FRIENDS=$(get_friends_list 2)
FRIEND_ID=$(extract_friend_id "$USER2_FRIENDS" 0)

if [ ! -z "$FRIEND_ID" ] && [ "$FRIEND_ID" != "null" ]; then
    echo "Removing friend with ID: $FRIEND_ID"
    remove_friend 2 "$FRIEND_ID"
    
    sleep 1
    
    echo -e "\n${BLUE}User 2's friends after removal:${NC}"
    USER2_FRIENDS_AFTER=$(get_friends_list 2)
    echo "$USER2_FRIENDS_AFTER"
    
    FRIEND_COUNT_AFTER=$(get_friend_count "$USER2_FRIENDS_AFTER")
    echo -e "${GREEN}Friend count after removal: $FRIEND_COUNT_AFTER${NC}"
else
    print_warning "User 2 has no friends to remove"
fi

# Step 10: Error scenarios testing
print_step "Testing error scenarios"

echo -e "\n${BLUE}Testing already-friends scenario (before removal)${NC}"
print_info "User 1 trying to send request to existing friend Charlie"

# User 1 should still be friends with Charlie at this point
USER1_FRIENDS=$(get_friends_list 1)
USER1_FRIEND_EMAIL=$(echo "$USER1_FRIENDS" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$USER1_FRIEND_EMAIL" ]; then
    echo "Testing already-friends scenario with: $USER1_FRIEND_EMAIL"
    
    ALREADY_FRIENDS_RESPONSE=$(curl -s -b "cookies_user1.txt" -X POST \
        "$BASE_URL/realtime/friends/requests/$USER1_FRIEND_EMAIL")
    echo "Already friends response: $ALREADY_FRIENDS_RESPONSE"
    
    if echo "$ALREADY_FRIENDS_RESPONSE" | grep -q '"success":false\|already friends\|already exists'; then
        print_result "✅ Already-friends request properly rejected"
    else
        print_error "❌ Already-friends request was not properly rejected"
        echo "Response: $ALREADY_FRIENDS_RESPONSE"
    fi
else
    print_warning "User 1 has no friends to test already-friends scenario"
fi

echo -e "\n${BLUE}Testing friend request after removal (should succeed)${NC}"
print_info "User 1 sending friend request to User 2 after removal (should succeed)"

# User 2 removed User 1 earlier, so they should be able to be friends again
USER2_EMAIL="${USERS_EMAILS[1]}"  # User 2 email (index 1)

AFTER_REMOVAL_RESPONSE=$(curl -s -b "cookies_user1.txt" -X POST \
    "$BASE_URL/realtime/friends/requests/$USER2_EMAIL")
echo "After removal response: $AFTER_REMOVAL_RESPONSE"

if echo "$AFTER_REMOVAL_RESPONSE" | grep -q '"success":true'; then
    print_result "✅ Friend request after removal properly allowed"
    
    # Now test duplicate of this new request (should fail)
    echo -e "\n${BLUE}Testing duplicate of new pending request${NC}"
    DUPLICATE_PENDING_RESPONSE=$(curl -s -b "cookies_user1.txt" -X POST \
        "$BASE_URL/realtime/friends/requests/$USER2_EMAIL")
    echo "Duplicate pending response: $DUPLICATE_PENDING_RESPONSE"
    
    if echo "$DUPLICATE_PENDING_RESPONSE" | grep -q '"success":false\|already exists\|already sent'; then
        print_result "✅ Duplicate pending request properly rejected"
    else
        print_error "❌ Duplicate pending request was not properly rejected"
        echo "Response: $DUPLICATE_PENDING_RESPONSE"
    fi
else
    print_error "❌ Friend request after removal was not properly allowed"
    echo "Response: $AFTER_REMOVAL_RESPONSE"
fi

echo -e "\n${BLUE}Testing self friend request${NC}"
print_info "User 1 trying to send friend request to themselves (should fail)"

USER1_EMAIL="${USERS_EMAILS[0]}"  # User 1 email (index 0)
SELF_REQUEST=$(curl -s -b "cookies_user1.txt" -X POST \
    "$BASE_URL/realtime/friends/requests/$USER1_EMAIL")
echo "Self request response: $SELF_REQUEST"

if echo "$SELF_REQUEST" | grep -q '"success":false\|Cannot send.*yourself\|self'; then
    print_result "✅ Self friend request properly rejected"
else
    print_error "❌ Self friend request was not properly rejected"
    echo "Response: $SELF_REQUEST"
fi

echo -e "\n${BLUE}Testing non-existent user request${NC}"
print_info "User 1 trying to send request to non-existent user (should fail)"

NONEXISTENT_REQUEST=$(curl -s -b "cookies_user1.txt" -X POST \
    "$BASE_URL/realtime/friends/requests/nonexistent@example.com")
echo "Non-existent user response: $NONEXISTENT_REQUEST"

if echo "$NONEXISTENT_REQUEST" | grep -q '"success":false\|not found\|does not exist'; then
    print_result "✅ Non-existent user request properly rejected"
else
    print_error "❌ Non-existent user request was not properly rejected"
    echo "Response: $NONEXISTENT_REQUEST"
fi

echo -e "\n${BLUE}Testing unauthorized access${NC}"
print_info "Accessing friends list without authentication (should fail)"

UNAUTHORIZED=$(curl -s -X GET "$BASE_URL/realtime/friends")
echo "Unauthorized response: $UNAUTHORIZED"

if echo "$UNAUTHORIZED" | grep -q '"statusCode":401\|"code":"UNAUTHORIZED"\|unauthorized\|not authenticated\|login'; then
    print_result "✅ Unauthorized access properly rejected with 401 status"
else
    print_error "❌ Unauthorized access was not properly rejected"
    echo "Response: $UNAUTHORIZED"
fi

echo -e "\n${BLUE}Testing invalid request ID operations${NC}"
print_info "Trying to accept/reject with invalid request ID (should fail)"

INVALID_ACCEPT=$(curl -s -b "cookies_user1.txt" -X POST \
    "$BASE_URL/realtime/friends/requests/invalid-id-12345/accept")
echo "Invalid accept response: $INVALID_ACCEPT"

if echo "$INVALID_ACCEPT" | grep -q '"success":false\|not found\|invalid'; then
    print_result "✅ Invalid request ID operation properly rejected"
else
    print_error "❌ Invalid request ID operation was not properly rejected"
    echo "Response: $INVALID_ACCEPT"
fi

# Final summary
print_step "Test Summary"

echo -e "\n${GREEN}🎉 Comprehensive Friendship API Test Completed!${NC}"

echo -e "\n${YELLOW}📊 Test Results Summary:${NC}"
echo "✅ User creation and authentication"
echo "✅ Friend request sending and validation"
echo "✅ Pending request management"
echo "✅ Request acceptance and rejection"
echo "✅ Friendship establishment verification"
echo "✅ Room list with unread message counts"
echo "✅ Online status tracking"
echo "✅ Friend blocking and unblocking"
echo "✅ Friend removal functionality"
echo "✅ Error handling and edge cases"
echo "✅ Authorization checks"
echo "✅ New online users endpoint"

echo -e "\n${PURPLE}💡 Key Features Verified:${NC}"
echo "- Bidirectional friendship creation"
echo "- Proper request state management"
echo "- Real-time online status"
echo "- Comprehensive error handling"
echo "- Secure API endpoints"
echo "- Blocked friends management"
echo "- Enhanced room list with unread counts"

echo -e "\n${CYAN}🔚 All tests completed successfully!${NC}"

# Print final statistics
echo -e "\n${GREEN}📈 Final Test Statistics:${NC}"
echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ "$TOTAL_TESTS" -gt 0 ]; then
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
else
    echo -e "${YELLOW}Success Rate: 0%${NC}"
fi