# MOOC Mock Server

Lightweight in-memory Express server for frontend testing.

Features:

- POST `/api/submissions` — create a submission payload { section, itemId, link, user }
- GET `/api/submissions` — list submissions (supports query params: `section`, `itemId`, `user`)
- GET `/api/submissions/student/:studentId` — submissions for a student
- GET `/api/students/:studentId/courses/:courseId` — minimal student-course object (includes `submissions`)

Quick start:

```powershell
cd "e:\Online Course Management Platform\MOOC\mock-server"
npm install
npm start
```

Server listens on `http://localhost:4000` by default.

Notes:

- Data is in-memory and will be lost on restart.
- Frontend can call `http://localhost:4000/api/...` or you can run the frontend dev server with a proxy to `/api`.
