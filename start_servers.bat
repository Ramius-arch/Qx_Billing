@echo off
cd backend && npm start > ../src/backend/backend-console.txt & cd ../frontend && npm run dev > ../src/frontend/frontend-console.txt