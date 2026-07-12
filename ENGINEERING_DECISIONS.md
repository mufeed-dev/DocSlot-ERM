# Engineering Decisions — DocSlot

This document explains the technical details, architecture decisions, and design choices behind the **DocSlot** clinic scheduler portal.

---

## 1. Project Architecture

The application is built on the **MERN (MongoDB, Express, React, Node)** stack, structured around principles of clean, decoupled code and clear separation of concerns.

### Backend Architecture (Layered Model-Service-Controller)
The backend is structured into four main layers:
*   **Models (Database Layer)**: Mongoose schemas defining collection structures, validations, hooks, and indexes. Business logic is kept out of here.
*   **Services (Business Logic Layer)**: All core functional requirements (e.g., dynamic slot generation, concurrency management, database transactions) reside in services.
*   **Controllers (Interface Layer)**: Lightweight entrypoints that validate client input (using Joi), invoke services, format standard responses, and trigger audit log hooks.
*   **Middlewares (Pipeline Layer)**: Centralized error handling, request logging, token verification, and Role-Based Access Control (RBAC).

*Why this choice?* Separating controllers from services makes the codebase modular, highly testable, and prevents duplicated logic (e.g., sharing slot availability logic between appointment creation and slot query endpoints).

### Frontend Architecture (Modular Redux Toolkit)
The client application uses **Vite** for optimized assets compilation and **Redux Toolkit (RTK)** for centralized state management:
*   State is split into logical slices: `auth`, `doctor`, `appointment`, and `patient`.
*   Asynchronous operations (API calls) are handled via RTK's `createAsyncThunk`.
*   Components are kept stateless and focus exclusively on UI presentation, drawing state from selectors.

---

## 2. MongoDB Schema Design & Relationships

The database is designed with reference-based relations (normalized) to match relational medical and staff workflows:

```
+------------------+          +-----------------------+
|      User        |          |        Patient        |
+------------------+          +-----------------------+
| - _id (ObjectId) |          | - _id (ObjectId)      |
| - email          |          | - patientId (Unique)  |
| - password       |          | - name (Text Index)   |
| - role (Enum)    |          | - phone (Index)       |
+--------+---------+          +-----------+-----------+
         |                                |
         | 1                              | 1
         |                                |
         | 1                              |
+--------v---------+                      |
|     Doctor       |                      |
+------------------+                      |
| - _id (ObjectId) |                      |
| - user (Ref)     |                      |
| - department     |                      |
+--------+---------+                      |
         |                                |
         | 1                              |
         |                                |
         | 1                              |
+--------v---------+                      |
|  DoctorSchedule  |                      |
+------------------+                      |
| - doctor (Ref)   |                      |
| - workingDays    |                      |
| - slotDuration   |                      |
| - sessions []    |                      |
| - breaks []      |                      |
+------------------+                      |
                                          |
         +--------------------------------+
         |
         | *
+--------v---------+
|   Appointment    |
+------------------+
| - _id (ObjectId) |
| - patient (Ref)  |
| - doctor (Ref)   |
| - date           |
| - slotTime       |
| - status         |
+------------------+
```

### Collections & Key Fields

1.  **Users (`User`)**:
    *   `email` (Unique String, Indexed)
    *   `password` (Hashed String)
    *   `role` (Enum: `superadmin`, `doctor`, `receptionist`)
    *   `refreshTokens` (Array of Hashed Strings for token rotation)
2.  **Doctors (`Doctor`)**:
    *   `user` (Ref to `User`, Indexed, Unique)
    *   `department` (String, Indexed)
    *   `specialization` (String)
    *   `isActive` (Boolean)
3.  **Doctor Schedules (`DoctorSchedule`)**:
    *   `doctor` (Ref to `Doctor`, Unique Index)
    *   `workingDays` (Array of numbers 0-6)
    *   `slotDuration` (Number in minutes)
    *   `sessions` (Array of `{ startTime, endTime }` subdocuments)
    *   `breaks` (Array of `{ startTime, endTime }` subdocuments)
4.  **Patients (`Patient`)**:
    *   `patientId` (Unique custom sequential String, e.g. `PAT-0001`)
    *   `name` (String, Text Indexed)
    *   `phone` (String, Indexed)
    *   `dateOfBirth` (Date)
5.  **Appointments (`Appointment`)**:
    *   `patient` (Ref to `Patient`, Indexed)
    *   `doctor` (Ref to `Doctor`, Compound Indexed)
    *   `date` (Date, Compound Indexed)
    *   `slotTime` (String, Compound Indexed)
    *   `status` (Enum: `scheduled`, `arrived`, `completed`, `cancelled`, Indexed)
    *   `bookedBy` (Ref to `User`)
6.  **Audit Logs (`AuditLog`)**:
    *   `user` (Ref to `User`)
    *   `role` (String)
    *   `action` (String, Indexed)
    *   `entity` & `entityId` (Ref details)
    *   `timestamp` (Date, Indexed)

---

## 3. Concurrency Handling & Double Booking Prevention

Preventing two users from booking the same doctor slot at the exact same time is a critical requirement. We solved this using a double-layered backend defense:

### Layer 1: Database Atomic Constraints (Compound Unique Index)
We created a compound unique index on the `Appointment` model:
```javascript
appointmentSchema.index(
  { doctor: 1, date: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["scheduled", "arrived", "completed"] },
    },
  }
);
```
*   **Why partial filter?** If an appointment is cancelled, we want to allow that slot to be booked again. By using a `partialFilterExpression`, Mongoose only enforces uniqueness for active appointments. If a slot is cancelled, it is excluded from index constraints, allowing the slot to be reused instantly.
*   **Atomic execution**: MongoDB guarantees that only one write can succeed for a unique index constraint, even when requests hit at the exact same millisecond.

### Layer 2: Service-Layer MongoDB Transactions
In `AppointmentService.create()`, appointment booking is run inside a **Session Transaction**:
1.  A session starts: `await mongoose.startSession()`.
2.  Transaction begins.
3.  The slot availability is fetched and evaluated.
4.  If the slot is free, the new `Appointment` is saved.
5.  If a parallel save operation completes first, the transaction will catch the duplicate key violation (code `11000`), roll back the transaction, and return a clean conflict response to the second caller.

---

## 4. Database Indexes & Query Optimizations

To keep query response times under 50ms, the following indexes are configured:

1.  **`User.email: 1` (Unique)**: Speeds up authentication lookups.
2.  **`Doctor.user: 1` (Unique)**: Optimizes lookup when retrieving profile data for a logged-in doctor.
3.  **`Doctor.department: 1`**: Speeds up doctor drop-down filtering.
4.  **`Patient.phone: 1`**: Essential for receptionist patient lookups.
5.  **`Patient.name: "text"`**: Optimizes search bars matching patients by name.
6.  **`Appointment.date: 1` & `Appointment.status: 1`**: Optimizes list queries filtering appointments by date ranges or current clinic state.
7.  **`AuditLog.timestamp: -1`**: Optimizes descending sort orders for the audit log dashboard.

---

## 5. Security Measures

1.  **bcrypt Password Hashing**: Passwords are saved hashed with salt rounds of 10.
2.  **JWT Authentication Cookie System**:
    *   Access token (15m expiry) and Refresh token (7d expiry) are used.
    *   Tokens are sent to the client via secure, httpOnly, sameSite cookies. This shields tokens from XSS (cross-site scripting) attacks, preventing javascript from accessing them.
3.  **Refresh Token Rotation (RTR)**:
    *   Refresh tokens are one-time use. When a user requests a new access token, the old refresh token is deleted and a new one is sent.
    *   If a hijacked refresh token is reused, the backend detects the breach, revokes all active refresh token sessions for that user, and requires them to log in again.
4.  **RBAC Gatekeeper**: Express middleware matches the user's token role against permitted values. Superadmin can create users, receptionists book visits, and doctors update consult notes.
5.  **Express Rate Limiting & Helmet**: Prevents DDoS, brute-force login attempts, and secures HTTP headers.

---

## 6. Performance Optimizations

1.  **Server-side Pagination & Selection Projecting**:
    *   Audit trails and appointment listings are paginated at the database layer using `skip()` and `limit()`.
    *   Database queries project out heavy or sensitive fields (e.g. `password`, `refreshTokens`) to reduce throughput size.
2.  **WebSocket Dynamic Slots Updates**: Real-time scheduler updates avoid polling overhead, reducing server resource loads.
3.  **Vite Code-Splitting**: React pages are lazy-loaded on request (`lazy()` / `<Suspense>`), decreasing initial page loading delays.
4.  **Debounced Searching**: Search fields wait for 500-600ms of user typing inactivity before firing API requests, avoiding database load spikes.

---

## 7. Scaling to Millions of Appointments

If the application grows to millions of active records, we would execute the following architectural updates:

1.  **Database Sharding**: Partition MongoDB collections horizontally by `doctor` (or a combination of `department` and `date`). This routes database writes to separate physical database servers.
2.  **Redis Cache Layer**: Dynamic slot generation queries are heavy. Storing calculated doctor schedules and booked times slots in an in-memory Redis cache would reduce database read operations by up to 90%.
3.  **Asynchronous Audit Logging**: Offload audit trailing logs from the request-response thread. Audit details would be pushed into an asynchronous message queue (e.g. RabbitMQ, Kafka) and processed by background worker processes.
4.  **Elasticsearch for Patient Searching**: Offload text searches and queries to a dedicated engine (like Elasticsearch) to keep MongoDB focused solely on transactional bookings.
