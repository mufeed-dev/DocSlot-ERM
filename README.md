# DocSlot — EMR Clinic Appointment Portal

DocSlot is a secure, real-time Electronic Medical Record (EMR) clinic scheduler application built on the MERN stack. It includes dynamic slot generation, concurrency protection against double-booking, Role-Based Access Control (RBAC), WebSocket notifications, and administrative audit logging.

Repository Link: [https://github.com/mufeed-dev/DocSlot-ERM.git](https://github.com/mufeed-dev/DocSlot-ERM.git)

---

## Folder Structure

```
DocSlot/
├── MERN Stack Developer Assessment.docx    # Assessment instructions
├── ENGINEERING_DECISIONS.md                # Design rationale (Mandatory)
├── API_DOCUMENTATION.md                    # Backend endpoints documentation
├── server/                                 # Express.js Server
│   ├── config/                             # DB connection & server variables
│   ├── controllers/                        # Input Joi validators & router logic
│   ├── middlewares/                        # Auth validator, RBAC, error handlers
│   ├── models/                             # MongoDB database schema files
│   ├── routes/                             # API routing maps
│   ├── services/                           # Business logic core layer
│   ├── utils/                              # Response formatters, winston, sockets
│   ├── logs/                               # Node environment log files
│   ├── package.json
│   └── server.js
└── client/                                 # React Vite Frontend
    ├── public/
    ├── src/
    │   ├── components/                     # Reusable modal and layout boxes
    │   ├── config/                         # URL config, defaults
    │   ├── pages/                          # Views (Scheduler, Login, Dashboard)
    │   ├── store/                          # Redux Toolkit slices
    │   ├── utils/                          # Axios API mappings & validators
    │   ├── App.jsx                         # Main router & Socket wrapper
    │   ├── index.css                       # Global styles & Tailwind v4 directive
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Environment Variables

### Backend Configuration (`server/.env`)
Create a file named `.env` in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/docslot
FRONTEND_URL=http://localhost:5173

JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ADMIN_EMAIL=admin@docslot.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Super Admin
```

### Frontend Configuration (`client/.env`)
Create a file named `.env` in the `client` directory (Optional - Vite defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Installation & Setup

Ensure you have **Node.js (v18+)** and **MongoDB** installed and running locally.

### Step 1: Clone the Repository
```bash
git clone https://github.com/mufeed-dev/DocSlot-ERM.git
cd DocSlot-ERM
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Install Client Dependencies
```bash
cd ../client
npm install
```

---

## Running the Project

### Running in Development Mode
You will need to open two terminal windows to run both services.

1.  **Start the Backend API Server**:
    ```bash
    cd server
    npm run dev
    ```
    *The server will initialize database connections, automatically seed the default Super Admin, and listen on port `5000`.*

2.  **Start the Frontend App**:
    ```bash
    cd client
    npm run dev
    ```
    *The frontend Vite dev server will start and run on `http://localhost:5173`.*

---

## Core Feature Workflows

### 1. Authentication (JWT Cookies)
*   Standard cookie-based token rehydration.
*   Access tokens expire in 15 minutes, refresh tokens expire in 7 days.
*   Token rotation is managed dynamically inside `AuthService.js`. If a token reuse is intercepted, all user sessions are invalidated.

### 2. Role-Based Access Control (RBAC)
*   **Super Admin**: Manage receptionist and doctor accounts. Set work schedules and slot duration settings. View full clinic lists and recent audit trail events.
*   **Receptionist**: Search patient lists, register new patients, book appointments, update check-in states (`scheduled` ➡️ `arrived`), and cancel appointments.
*   **Doctor**: Access dashboard to view their scheduled consultations, check patient information, and save clinical consultation notes.

### 3. Dynamic Slots Generation
*   Generated dynamically in `SlotService.js` by combining working schedule session limits, dividing duration ranges, skipping lunch breaks, and checking existing database bookings.

### 4. Concurrency Protection
*   Handled at the database level by a unique compound index on `{ doctor, date, slotTime }` targeting active statuses. Supported by Mongoose Transactions in the service layer to prevent slot race conditions.

### 5. Websocket Scheduler Updates
*   Uses Socket.IO. When any user creates, cancels, or changes an appointment status, a real-time event updates all scheduler screens without requiring page reloads.

---

## Technical Documentation Links

*   For details on schema structure, index optimizations, security policies, and concurrency transaction logic, refer to: **[ENGINEERING_DECISIONS.md](ENGINEERING_DECISIONS.md)**
*   For detailed documentation on the RESTful API endpoints, request bodies, and responses, refer to: **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---

## Assumptions Made

1.  **Doctor Profiles**: A doctor's specialization, department, and contact details are linked to their base login account profile. Deleting or disabling the user account disables their medical profiles automatically.
2.  **Schedules**: Doctors have a single default work schedule profile (sessions, slot duration, breaks) that applies to all active working days.
3.  **Audit Logs**: Security log listings exclude authentication login, logout, and token rotation refreshes to ensure that the audit view is strictly focused on clinical actions.

---

## Future Improvements

1.  **Multi-session Breaks**: Support custom breaks for individual sessions.
2.  **Telemetry Reporting**: Integrate dashboard graphs showing daily consultation counts, active department loads, and appointment status metrics.
3.  **SMS/Email reminders**: Integrated patient notifications on check-in or appointment cancellations.
