#!/bin/bash

echo "Starting FinTech SSE Gateway Services and Mock Servers"
echo "======================================================="

cleanup() {
    echo "\nShutting down services..."
    kill $(jobs -p) 2>/dev/null
    lsof -ti:8080,8081,8082,8083 | xargs kill -9 2>/dev/null || true
    exit 0
}

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use. Killing existing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

trap cleanup SIGINT

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run mock servers."
    exit 1
fi

echo "Checking mock server dependencies..."
cd mock-sse-servers
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
cd ..

echo "Checking ports and cleaning up existing processes..."
check_port 8080
check_port 8081
check_port 8082
check_port 8083

echo "Starting Mock SSE Servers:"

echo "  → Account Service (port 8081)"
(cd mock-sse-servers && node wallet-service.js) &
WALLET_PID=$!

echo "  → Payment Processing Service (port 8082)" 
(cd mock-sse-servers && node game-service.js) &
GAME_PID=$!

echo "  → Customer Service (port 8083)"
(cd mock-sse-servers && node user-service.js) &
USER_PID=$!

sleep 3

echo "\nStarting SSE Gateway Service:"
echo "  → Gateway Service (port 8080)"
./gradlew bootRun &
GATEWAY_PID=$!

echo "\nWaiting for services to initialize..."
sleep 10

echo "\nAll Services Started Successfully!"
echo "=================================="
echo
echo "Mock SSE Endpoints:"
echo "  Account Service:          http://localhost:8081"
echo "    • Low Balance Alerts:    http://localhost:8081/accounts/low-balance-alerts"
echo "    • Account Transactions:  http://localhost:8081/accounts/transaction-events"
echo
echo "  Payment Processing:       http://localhost:8082"
echo "    • Payment Transactions:  http://localhost:8082/transactions/sse"
echo "    • High-Value Transactions: http://localhost:8082/transactions/high-value"
echo
echo "  Customer Service:         http://localhost:8083"
echo "    • Customer Activity:     http://localhost:8083/customers/activity"
echo "    • Security Alerts:       http://localhost:8083/customers/security-alerts"
echo
echo "SSE Gateway Endpoints:"
echo "  Public Gateway:     http://localhost:8080/public/events (always available)"
echo "  Secured Gateway:    http://localhost:8080/events (when security enabled, requires JWT)"
echo
echo "Example Usage:"
echo "  Public: curl \"http://localhost:8080/public/events?sources=account-low-balance,payment-transactions&customerId=cust123\""
echo "  Secured: curl -H \"Authorization: Bearer <JWT_TOKEN>\" \"http://localhost:8080/events?sources=customer-profile-events\""
echo
echo "Note: To enable security, set 'sse-gateway.security=true' in application.yaml"
echo
echo "Press Ctrl+C to stop all services"

wait