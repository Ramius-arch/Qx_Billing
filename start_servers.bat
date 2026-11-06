@echo off
echo Starting Qx_Billing Stack (Private Owner Ledger Canvas)...

echo Starting Backend on port 5000...
start "Qx_Billing Backend" cmd /k "cd backend && npm start"

echo Starting Frontend on port 5173...
start "Qx_Billing Frontend" cmd /k "cd frontend && npm run dev"

echo Done! Backend and Frontend are launching in separate windows.
pause
