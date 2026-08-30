MAAJ PHARMACY BACKEND

Files:
- server.js
- package.json
- config/db.js
- controllers/medicineController.js
- routes/medicineRoutes.js
- uploads/

IMPORTANT:
1. Put this "backend" folder beside your frontend folder.
2. The backend uses PostgreSQL database: medistore, localhost:5432, user postgres.
3. No PostgreSQL password is stored in this project.
4. Install dependencies only after all code is ready:
   npm install
5. Then start:
   npm start

API:
GET    /api/medicines
GET    /api/medicines/:id
POST   /api/medicines
POST   /api/medicines/bulk
PUT    /api/medicines/:id
DELETE /api/medicines/:id

The medicine table "maaj_medicines" is created automatically if it does not exist.

Next integration step:
Update index.html and medicine-manager.html so they use http://localhost:5000/api/medicines instead of localStorage for shared medicines.
