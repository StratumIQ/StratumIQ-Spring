# StratumIQ Admin API Reference

Base URL: `http://localhost:5000/api/admin`

Authentication: `Authorization: Bearer <accessToken>`  
Required roles: `ADMIN` or `SUPER_ADMIN`

---

## Executive Dashboard

### GET /admin/dashboard/kpis

**Description:** Platform KPI summary.

**Response 200:**
```json
{
  "totalUsers": 42,
  "activeUsersToday": 5,
  "newRegistrations": 12,
  "totalFleets": 18,
  "totalEquipment": 64,
  "openSupportTickets": 3,
  "mostActiveCustomers": [
    { "userId": 1, "name": "Jane Doe", "email": "jane@example.com", "equipmentCount": 8 }
  ]
}
```

---

### GET /admin/dashboard/user-growth?days=90

**Response 200:**
```json
{
  "series": [
    { "date": "2026-03-01", "count": 2 },
    { "date": "2026-03-02", "count": 0 }
  ]
}
```

---

### GET /admin/dashboard/fleet-growth?days=90

Same shape as user growth.

---

### GET /admin/dashboard/recent-activities?limit=20

**Response 200:**
```json
{
  "activities": [
    {
      "id": 1,
      "action": "TICKET_CREATED",
      "entityType": "SUPPORT_TICKET",
      "entityId": 5,
      "createdAt": "2026-06-13T10:00:00Z"
    }
  ]
}
```

---

## User Management

### GET /admin/users?search=&role=all&status=all&page=1&limit=20

**Response 200:**
```json
{
  "users": [
    {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "role": "USER",
      "status": "ACTIVE",
      "tenantId": 1,
      "emailVerified": true,
      "phoneVerified": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLoginAt": "2026-06-13T08:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

### PUT /admin/users/{id}

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890"
}
```

**Error 400:**
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "fields": { "email": "must be a well-formed email address" }
}
```

---

### PATCH /admin/users/{id}/status

**Request:** `{ "status": "BANNED" }` or `{ "status": "ACTIVE" }`

---

### PATCH /admin/users/{id}/role

**Request:** `{ "role": "DEALER" }`

**Error 403:** Only SUPER_ADMIN can assign ADMIN role.

---

### POST /admin/users/{id}/reset-password

**Response 200:**
```json
{
  "message": "Temporary password generated. Share securely with the user.",
  "temporaryPassword": "xK9!mP2nQr4T"
}
```

---

## Fleet Monitoring (Read-only)

### GET /admin/fleet/equipment?status=all&search=&page=1&limit=20

### GET /admin/fleet/equipment/{id}

### GET /admin/fleet/health

**Response 200:**
```json
{
  "totalEquipment": 64,
  "statusBreakdown": { "ACTIVE": 50, "MAINTENANCE": 8, "IDLE": 6 },
  "maintenanceCount": 8
}
```

### GET /admin/fleet/activity?limit=50

---

## Support Center

### GET /admin/support/tickets?status=all&search=&page=1&limit=20

### POST /admin/support/tickets

**Request:**
```json
{
  "userId": 2,
  "subject": "Dashboard not loading",
  "description": "User reports blank screen after login.",
  "priority": "HIGH"
}
```

---

### PATCH /admin/support/tickets/{id}/assign

**Request:** `{ "assignedTo": 1 }`

---

### PATCH /admin/support/tickets/{id}/status

**Request:** `{ "status": "IN_PROGRESS" }`

Valid statuses: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_CUSTOMER`, `RESOLVED`

---

### POST /admin/support/tickets/{id}/notes

**Request:**
```json
{
  "body": "Contacted customer via email.",
  "isInternal": true
}
```

---

## Test Credentials (seed data)

- Email: `admin@stratumiq.com`
- Password: `Admin@123456`

Swagger UI: `http://localhost:5000/swagger-ui/index.html`
