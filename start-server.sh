#!/bin/bash
echo "Starting Machimachi Chat Shopping Street server..."
cd /Users/hidekisaito/Desktop/machimachi2
npm run dev &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
echo "Access the site at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
wait $SERVER_PID