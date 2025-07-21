#!/bin/bash

echo "=== 🔗 Room API Endpoints Test ==="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="http://localhost:3000/api"
TIMESTAMP=$(date +%s)

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
print_step() {
    echo -e "\n${CYAN}📋 $1${NC}"
}

print_result() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
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

# API Test Helper
api_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local cookie_file="$5"
    local expected_status="$6"
    local expected_content="$7"
    
    run_test "$test_name"
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method $BASE_URL$endpoint"
    
    if [ ! -z "$cookie_file" ]; then
        curl_cmd="$curl_cmd -b $cookie_file"
    fi
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    local response=$(eval "$curl_cmd")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    echo "Request: $method $endpoint"
    echo "Status: $status_code"
    echo "Response: $body"
    
    local test_passed=true
    
    # Check status code
    if [ "$status_code" = "$expected_status" ]; then
        echo "✓ Status code matches expected ($expected_status)"
    else
        echo "✗ Status code mismatch. Expected: $expected_status, Got: $status_code"
        test_passed=false
    fi
    
    # Check response content if provided
    if [ ! -z "$expected_content" ]; then
        if echo "$body" | grep -q "$expected_content"; then
            echo "✓ Response contains expected content: $expected_content"
        else
            echo "✗ Response missing expected content: $expected_content"
            test_passed=false
        fi
    fi
    
    # Count result only once per test
    if [ "$test_passed" = true ]; then
        print_result "Test passed"
        return 0
    else
        print_error "Test failed"
        return 1
    fi
}

# Setup function
setup_test_environment() {
    print_step "Setting up test environment"
    
    # Create test user
    local user_email="roomapi_${TIMESTAMP}@test.com"
    local user_name="Room API User ${TIMESTAMP}"
    local username="roomapi${TIMESTAMP}"
    
    # Register user
    curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$user_email\",
            \"name\": \"$user_name\",
            \"username\": \"$username\",
            \"password\": \"password123\",
            \"avatarUrl\": \"/files/avatar.png\"
        }" > /dev/null
    
    # Login user
    curl -s -c "test_cookie.txt" -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$user_email\",\"password\":\"password123\"}" > /dev/null
    
    # Get user info
    local user_info=$(curl -s -b "test_cookie.txt" -X GET "$BASE_URL/auth/whoami")
    TEST_USER_ID=$(echo "$user_info" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    echo "Test user created with ID: $TEST_USER_ID"
    print_info "Test environment setup complete"
}

# Cleanup function
cleanup_test_environment() {
    print_step "Cleaning up test environment"
    
    if [ -f "test_cookie.txt" ]; then
        curl -s -b "test_cookie.txt" -X POST "$BASE_URL/auth/logout" > /dev/null
        rm -f "test_cookie.txt"
    fi
    
    print_info "Test environment cleanup complete"
}

# Test room creation endpoint
test_room_creation() {
    print_step "Testing Room Creation API"
    
    # Test 1: Valid room creation
    api_test "Create valid public room" \
        "POST" "/realtime/rooms" \
        '{"name": "API Test Room", "description": "Test room", "isPrivate": false, "maxUsers": 10}' \
        "test_cookie.txt" "201" '"id"'
    
    # Test 2: Create private room
    api_test "Create valid private room" \
        "POST" "/realtime/rooms" \
        '{"name": "Private API Room", "description": "Private test room", "isPrivate": true, "maxUsers": 5}' \
        "test_cookie.txt" "201" '"isPrivate":true'
    
    # Test 3: Unauthorized room creation
    api_test "Unauthorized room creation" \
        "POST" "/realtime/rooms" \
        '{"name": "Unauthorized Room", "description": "Should fail", "isPrivate": false, "maxUsers": 10}' \
        "" "401" '"statusCode":401'
    
    # Test 4: Invalid data
    api_test "Room creation with invalid data" \
        "POST" "/realtime/rooms" \
        '{"name": "", "description": "Empty name", "isPrivate": false, "maxUsers": 10}' \
        "test_cookie.txt" "400" '"statusCode":400'
    
    # Test 5: Duplicate room name
    api_test "Duplicate room name" \
        "POST" "/realtime/rooms" \
        '{"name": "API Test Room", "description": "Duplicate", "isPrivate": false, "maxUsers": 10}' \
        "test_cookie.txt" "400" '"statusCode":400'
}

# Test room retrieval endpoint
test_room_retrieval() {
    print_step "Testing Room Retrieval API"
    
    # First, create a room to retrieve
    local room_response=$(curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
        -H "Content-Type: application/json" \
        -d '{"name": "Retrieval Test Room", "description": "For testing retrieval", "isPrivate": false, "maxUsers": 10}')
    
    local room_id=$(echo "$room_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$room_id" ]; then
        # Test 1: Valid room retrieval
        api_test "Get existing room" \
            "GET" "/realtime/rooms/$room_id" \
            "" "test_cookie.txt" "200" '"name":"Retrieval Test Room"'
        
        # Test 2: Get non-existent room
        api_test "Get non-existent room" \
            "GET" "/realtime/rooms/invalid-room-id" \
            "" "test_cookie.txt" "404" '"statusCode":404'
        
        # Test 3: Unauthorized room access
        api_test "Unauthorized room access" \
            "GET" "/realtime/rooms/$room_id" \
            "" "" "401" '"statusCode":401'
    else
        print_error "Failed to create room for retrieval tests"
    fi
}

# Test room join endpoint with sync
test_room_join() {
    print_step "Testing Room Join API with Message Sync"
    
    # Create a room for join testing
    local room_response=$(curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
        -H "Content-Type: application/json" \
        -d '{"name": "Join Test Room", "description": "For testing join", "isPrivate": false, "maxUsers": 10}')
    
    local room_id=$(echo "$room_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$room_id" ]; then
        # Test 1: Valid room join with sync
        api_test "Join existing room with sync" \
            "POST" "/realtime/rooms/$room_id/join" \
            "" "test_cookie.txt" "200" '"room"'
        
        # Test 2: Join non-existent room
        api_test "Join non-existent room" \
            "POST" "/realtime/rooms/invalid-room-id/join" \
            "" "test_cookie.txt" "404" '"statusCode":404'
        
        # Test 3: Unauthorized join
        api_test "Unauthorized room join" \
            "POST" "/realtime/rooms/$room_id/join" \
            "" "" "401" '"statusCode":401'
        
        # Test 4: Join room not a member of (should fail with 403)
        # Create second user for this test
        local user2_email="roomapi2_${TIMESTAMP}@test.com"
        local user2_name="Room API User 2 ${TIMESTAMP}"
        local user2_username="roomapi2${TIMESTAMP}"
        
        # Register second user
        curl -s -X POST "$BASE_URL/auth/register" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"$user2_email\",
                \"name\": \"$user2_name\",
                \"username\": \"$user2_username\",
                \"password\": \"password123\",
                \"avatarUrl\": \"/files/avatar.png\"
            }" > /dev/null
        
        # Login second user
        curl -s -c "test_cookie2.txt" -X POST "$BASE_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$user2_email\",\"password\":\"password123\"}" > /dev/null
        
        api_test "Join room not a member of" \
            "POST" "/realtime/rooms/$room_id/join" \
            "" "test_cookie2.txt" "403" '"statusCode":403'
        
        # Clean up second user cookie
        if [ -f "test_cookie2.txt" ]; then
            curl -s -b "test_cookie2.txt" -X POST "$BASE_URL/auth/logout" > /dev/null
            rm -f "test_cookie2.txt"
        fi
    else
        print_error "Failed to create room for join tests"
    fi
}

# Test room list endpoint
test_room_list() {
    print_step "Testing Room List API with Unread Counts"
    
    # Test 1: Get user's room list with unread counts
    api_test "Get user room list with unread counts" \
        "GET" "/realtime/rooms/$TEST_USER_ID/roomlist" \
        "" "test_cookie.txt" "200" '"unreadCount"'
    
    # Test 2: Verify unreadCount field structure
    run_test "Verify unreadCount field structure"
    local roomlist_response=$(curl -s -b "test_cookie.txt" -X GET "$BASE_URL/realtime/rooms/$TEST_USER_ID/roomlist")
    
    if echo "$roomlist_response" | grep -q '"unreadCount":[0-9]*'; then
        print_result "✅ unreadCount field properly included in room list"
    else
        print_error "❌ unreadCount field missing from room list response"
    fi
    
    # Test 3: Get non-existent user's room list (should return 403 due to security check)
    api_test "Get non-existent user room list" \
        "GET" "/realtime/rooms/invalid-user-id/roomlist" \
        "" "test_cookie.txt" "403" '"statusCode":403'
    
    # Test 4: Unauthorized access to room list
    api_test "Unauthorized room list access" \
        "GET" "/realtime/rooms/$TEST_USER_ID/roomlist" \
        "" "" "401" '"statusCode":401'
    
    # Test 5: Access to other user's room list (create second user for this test)
    local user2_email="roomapi2_${TIMESTAMP}@test.com"
    local user2_name="Room API User 2 ${TIMESTAMP}"
    local user2_username="roomapi2${TIMESTAMP}"
    
    # Register second user
    curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$user2_email\",
            \"name\": \"$user2_name\",
            \"username\": \"$user2_username\",
            \"password\": \"password123\",
            \"avatarUrl\": \"/files/avatar.png\"
        }" > /dev/null
    
    # Login second user
    curl -s -c "test_cookie2.txt" -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$user2_email\",\"password\":\"password123\"}" > /dev/null
    
    # Try to access first user's room list with second user's credentials
    api_test "Access to other user's room list" \
        "GET" "/realtime/rooms/$TEST_USER_ID/roomlist" \
        "" "test_cookie2.txt" "403" '"statusCode":403'
    
    # Clean up second user cookie
    if [ -f "test_cookie2.txt" ]; then
        curl -s -b "test_cookie2.txt" -X POST "$BASE_URL/auth/logout" > /dev/null
        rm -f "test_cookie2.txt"
    fi
}

# Test room members endpoint
test_room_members() {
    print_step "Testing Room Members API"
    
    # Create a room for member testing
    local room_response=$(curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
        -H "Content-Type: application/json" \
        -d '{"name": "Members Test Room", "description": "For testing members", "isPrivate": false, "maxUsers": 10}')
    
    local room_id=$(echo "$room_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$room_id" ]; then
        # Test 1: Get room members
        api_test "Get room members" \
            "GET" "/realtime/rooms/$room_id/members" \
            "" "test_cookie.txt" "200" '"userId"'
        
        # Test 2: Get members of non-existent room
        api_test "Get members of non-existent room" \
            "GET" "/realtime/rooms/invalid-room-id/members" \
            "" "test_cookie.txt" "404" '"statusCode":404'
        
        # Test 3: Unauthorized members access
        api_test "Unauthorized members access" \
            "GET" "/realtime/rooms/$room_id/members" \
            "" "" "401" '"statusCode":401'
    else
        print_error "Failed to create room for member tests"
    fi
}

# Test room invitation endpoint
test_room_invitation() {
    print_step "Testing Room Invitation API"
    
    # Create a room for invitation testing
    local room_response=$(curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
        -H "Content-Type: application/json" \
        -d '{"name": "Invitation Test Room", "description": "For testing invitations", "isPrivate": false, "maxUsers": 10}')
    
    local room_id=$(echo "$room_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$room_id" ]; then
        # Test 1: Invalid invitation (non-existent user should return 400)
        api_test "Invalid room invitation (non-existent user)" \
            "POST" "/realtime/rooms/$room_id/invite" \
            '{"inviteeNames": ["NonExistentUser"]}' \
            "test_cookie.txt" "400" '"statusCode":400'
        
        # Test 2: Empty invitation list
        api_test "Empty invitation list" \
            "POST" "/realtime/rooms/$room_id/invite" \
            '{"inviteeNames": []}' \
            "test_cookie.txt" "200" '"success"'
        
        # Test 3: Invite to non-existent room
        api_test "Invite to non-existent room" \
            "POST" "/realtime/rooms/invalid-room-id/invite" \
            '{"inviteeNames": ["TestUser"]}' \
            "test_cookie.txt" "404" '"statusCode":404'
        
        # Test 4: Unauthorized invitation
        api_test "Unauthorized invitation" \
            "POST" "/realtime/rooms/$room_id/invite" \
            '{"inviteeNames": ["TestUser"]}' \
            "" "401" '"statusCode":401'
        
        # Test 5: Invalid invitation data
        api_test "Invalid invitation data" \
            "POST" "/realtime/rooms/$room_id/invite" \
            '{"invalidField": "value"}' \
            "test_cookie.txt" "400" '"statusCode":400'
    else
        print_error "Failed to create room for invitation tests"
    fi
}

# Test room leave endpoint
test_room_leave() {
    print_step "Testing Room Leave API"
    
    # Create a room for leave testing
    local room_response=$(curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
        -H "Content-Type: application/json" \
        -d '{"name": "Leave Test Room", "description": "For testing leave", "isPrivate": false, "maxUsers": 10}')
    
    local room_id=$(echo "$room_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$room_id" ]; then
        # Test 1: Valid room leave
        api_test "Valid room leave" \
            "POST" "/realtime/rooms/$room_id/leave" \
            "" "test_cookie.txt" "200" '"success":true'
        
        # Test 2: Leave non-existent room
        api_test "Leave non-existent room" \
            "POST" "/realtime/rooms/invalid-room-id/leave" \
            "" "test_cookie.txt" "404" '"statusCode":404'
        
        # Test 3: Unauthorized leave
        api_test "Unauthorized leave" \
            "POST" "/realtime/rooms/$room_id/leave" \
            "" "" "401" '"statusCode":401'
        
        # Test 4: Leave room not a member of
        local other_room_response=$(curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
            -H "Content-Type: application/json" \
            -d '{"name": "Other Leave Test Room", "description": "Another room", "isPrivate": false, "maxUsers": 10}')
        
        local other_room_id=$(echo "$other_room_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        
        if [ ! -z "$other_room_id" ]; then
            # First leave the room to test leaving a room you're not in
            curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms/$other_room_id/leave" > /dev/null
            
            api_test "Leave room not a member of" \
                "POST" "/realtime/rooms/$other_room_id/leave" \
                "" "test_cookie.txt" "404" '"statusCode":404'
        fi
    else
        print_error "Failed to create room for leave tests"
    fi
}

# Test error handling
test_error_handling() {
    print_step "Testing Error Handling"
    
    # Test 1: Invalid JSON data
    api_test "Invalid JSON data" \
        "POST" "/realtime/rooms" \
        '{"name": "Invalid JSON", "description": "Missing quote}' \
        "test_cookie.txt" "400" '"statusCode":400'
    
    # Test 2: Missing required fields
    api_test "Missing required fields" \
        "POST" "/realtime/rooms" \
        '{"description": "No name field"}' \
        "test_cookie.txt" "400" '"statusCode":400'
    
    # Test 3: Invalid endpoint
    api_test "Invalid endpoint" \
        "GET" "/realtime/invalid-endpoint" \
        "" "test_cookie.txt" "404" '"statusCode":404'
    
    # Test 4: Non-existent endpoint with different HTTP method
    api_test "Non-existent endpoint" \
        "DELETE" "/realtime/rooms" \
        "" "test_cookie.txt" "404" '"statusCode":404'
}

# Test performance scenarios
test_performance() {
    print_step "Testing Performance Scenarios"
    
    # Test 1: Rapid room creation
    run_test "Rapid room creation performance"
    
    local start_time=$(date +%s)
    for i in {1..5}; do
        curl -s -b "test_cookie.txt" -X POST "$BASE_URL/realtime/rooms" \
            -H "Content-Type: application/json" \
            -d '{"name": "Perf Test Room '$i'", "description": "Performance test", "isPrivate": false, "maxUsers": 10}' > /dev/null &
    done
    wait
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "Rapid room creation completed in $duration seconds"
    
    if [ $duration -lt 10 ]; then
        print_info "Rapid room creation completed in reasonable time"
        print_result "Performance test passed"
    else
        print_warning "Rapid room creation took longer than expected"
        print_error "Performance test failed"
    fi
}

# Main execution
main() {
    echo -e "${PURPLE}🚀 Starting Room API Endpoints Test${NC}"
    echo -e "${PURPLE}Test session: $TIMESTAMP${NC}"
    
    # Setup
    setup_test_environment
    
    # Run all tests
    test_room_creation
    test_room_retrieval
    test_room_join
    test_room_list
    test_room_members
    test_room_invitation
    test_room_leave
    test_error_handling
    test_performance
    
    # Cleanup
    cleanup_test_environment
    
    # Results summary
    print_step "Test Results Summary"
    
    echo -e "\n${GREEN}📊 API Test Results:${NC}"
    echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ "$TOTAL_TESTS" -gt 0 ]; then
        local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
    else
        echo -e "${YELLOW}Success Rate: 0%${NC}"
    fi
    
    echo -e "\n${CYAN}🔍 New Features Tested:${NC}"
    echo "✅ Room join API with message sync"
    echo "✅ Room list API with unread message counts"
    echo "✅ unreadCount field validation"
    echo "✅ Enhanced room list response structure"
    echo "✅ Security checks for room access"
    echo "✅ Comprehensive error handling"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All API tests passed successfully!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some API tests failed. Please review the output above.${NC}"
        exit 1
    fi
}

# Trap to ensure cleanup
trap cleanup_test_environment EXIT

# Run main function
main 