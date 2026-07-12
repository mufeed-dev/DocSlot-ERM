# API Documentation — DocSlot

DocSlot exposes a RESTful web service API conforming to standard HTTP response codes and a consistent JSON payload structure.

---

## Centralized Response Format

### Success Response
```json
{
  "success": true,
  "timestamp": "2026-07-11T12:00:00.000Z",
  "requestId": "6a51fcdc16d47acf94aefe6b",
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "timestamp": "2026-07-11T12:00:00.000Z",
  "requestId": "6a51fcdc16d47acf94aefe6b",
  "message": "Reason for failure",
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "details": []
}
```

---

## API Endpoints List

### 1. Authentication

#### **POST** `/api/v1/auth/login`
Authenticates a user session, returning the user profile and setting Secure HttpOnly cookies for `accessToken` and `refreshToken`.
*   **Request Body**:
    ```json
    {
      "email": "admin@docslot.com",
      "password": "Admin@123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "_id": "603f9a7d3b5b634898ecfe22",
          "name": "Super Admin",
          "email": "admin@docslot.com",
          "role": "superadmin",
          "isActive": true
        }
      }
    }
    ```

#### **POST** `/api/v1/auth/refresh`
Rotates and generates a new access token and refresh token. Cookies are sent and refreshed automatically.
*   **Request Body**: None (Uses httpOnly cookies)
*   **Response (200 OK)**: Validates session and returns refreshed user details.

#### **POST** `/api/v1/auth/logout`
Revokes the current refresh token from the database and clears authentication cookies.
*   **Headers**: Requires authentication token cookie.
*   **Response (200 OK)**: `{ "success": true, "message": "Logout successful" }`

---

### 2. Users (Administrative Management)

#### **POST** `/api/v1/users`
Creates a staff profile account. Only accessible by **Super Admin**.
*   **Request Body**:
    ```json
    {
      "name": "Jane Smith",
      "email": "jane@clinic.com",
      "password": "Password@123",
      "role": "receptionist"
    }
    ```
*   **Response (210 Created)**: Created user details.

#### **GET** `/api/v1/users`
Lists administrative profiles. By default, it excludes `superadmin` role listing. Only accessible by **Super Admin**.
*   **Query Parameters**:
    *   `role`: `receptionist` or `doctor` (Optional)
*   **Response (200 OK)**: Arrays of user objects.

---

### 3. Doctors

#### **POST** `/api/v1/doctors`
Registers a doctor profile and creates the base user profile with the `doctor` role. Only accessible by **Super Admin**.
*   **Request Body**:
    ```json
    {
      "name": "Dr. Allan",
      "email": "allan@clinic.com",
      "password": "Password@123",
      "department": "Cardiology",
      "specialization": "Cardiologist",
      "qualification": "MD Cardiology",
      "phone": "9876543210"
    }
    ```
*   **Response (201 Created)**: Base user profile reference and doctor detail record.

#### **GET** `/api/v1/doctors`
Retrieves list of active doctor profiles. Accessible by all authenticated users.
*   **Query Parameters**:
    *   `department`: Filters doctors by department name regex (Optional).

---

### 4. Schedules & Slots

#### **POST** `/api/v1/schedules`
Creates or updates a doctor schedule. Only accessible by **Super Admin**.
*   **Request Body**:
    ```json
    {
      "doctor": "603f9a7d3b5b634898ecfe25",
      "workingDays": [1, 2, 3, 4, 5],
      "slotDuration": 15,
      "sessions": [
        { "startTime": "09:00", "endTime": "12:00" },
        { "startTime": "13:00", "endTime": "17:00" }
      ],
      "breaks": [
        { "startTime": "12:00", "endTime": "13:00" }
      ]
    }
    ```
*   **Response (200 OK)**: Saved schedule configuration.

#### **GET** `/api/v1/slots`
Generates a dynamic list of daily appointment slots. Evaluates working sessions, breaks, booked appointments, and past times.
*   **Query Parameters**:
    *   `doctorId`: ObjectId of Doctor profile (Required)
    *   `date`: Target date string, format `YYYY-MM-DD` (Required)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "time": "09:00", "status": "past" },
        { "time": "09:15", "status": "booked" },
        { "time": "09:30", "status": "available" }
      ]
    }
    ```

---

### 5. Patients

#### **POST** `/api/v1/patients`
Registers a new patient. Accessible by **Super Admin** and **Receptionist**.
*   **Request Body**:
    ```json
    {
      "name": "Thomas Edison",
      "email": "thomas@edison.com",
      "phone": "9999988888",
      "gender": "male",
      "dateOfBirth": "1995-10-12"
    }
    ```
*   **Response (201 Created)**: Created Patient detail containing generated unique sequential ID, e.g., `PAT-0004`.

#### **GET** `/api/v1/patients/search`
Searches for patients based on patient ID, phone, or name.
*   **Query Parameters**:
    *   `query`: Search term (Required)
*   **Response (200 OK)**: List of matching patient records (limit 10).

---

### 6. Appointments

#### **POST** `/api/v1/appointments`
Books a new appointment. Checks slot eligibility, prevents double booking, and emits real-time updates. Accessible by **Super Admin** and **Receptionist**.
*   **Request Body**:
    ```json
    {
      "patient": "603f9a7d3b5b634898ecfe88", 
      "doctor": "603f9a7d3b5b634898ecfe25",
      "department": "Cardiology",
      "date": "2026-07-15",
      "slotTime": "09:30",
      "purpose": "Routine consult",
      "notes": "Bring previous reports"
    }
    ```

#### **GET** `/api/v1/appointments`
Returns a paginated list of appointments with support for sorting, filtering, and searching.
*   **Query Parameters**:
    *   `page`: Page index (default: 1)
    *   `limit`: Page size (default: 12)
    *   `search`: Text search string matches patient name/ID or doctor name
    *   `status`: Filter by status (`scheduled`, `arrived`, `completed`, `cancelled`)
    *   `doctorId` / `patientId` / `department` / `dateFrom` / `dateTo`
*   **Response (200 OK)**: Includes matching appointment arrays and a `pagination` metadata block.

#### **PUT** `/api/v1/appointments/:id`
Updates appointment details. Enforces state transition checks:
*   *Scheduled* ➡️ *Arrived* / *Cancelled*
*   *Arrived* ➡️ *Completed* / *Cancelled*
*   **Request Body**: `{ "notes": "...", "purpose": "..." }` or `{ "status": "completed" }`.

#### **DELETE** `/api/v1/appointments/:id`
Cancels an appointment. Accessible by **Super Admin** and **Receptionist**.
*   **Request Body**: `{ "reason": "Patient requested" }`

#### **POST** `/api/v1/appointments/:id/arrive`
Marks a patient as arrived at the clinic. Accessible by **Super Admin** and **Receptionist**.

---

### 7. Audit Logging

#### **GET** `/api/v1/audit`
Retrieves paginated audit log entries. Filters out authentication logins/logouts/token refreshes to only show major database creations, cancel actions, or scheduling changes. Accessible by **Super Admin** only.
*   **Query Parameters**:
    *   `page`: Page number (default: 1)
    *   `limit`: Page limit (default: 50)
