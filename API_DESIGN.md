# Tuk-Tuk Tracking API - Design & Architecture Document

## 1. Business Requirements Analysis

### System Objectives

The system is designed to:

- Provide real-time location tracking of registered three-wheelers (tuk-tuks)
- Maintain historical movement logs for investigations
- Support province and district-wise filtering for law enforcement operations
- Enable secure access for users at HQ, Provincial, and Station levels

### User Roles

1. **Central Admin (HQ)**: Full system access, manages provinces, districts, police stations, users
2. **Provincial Admin**: Manages their province's districts, police stations, and users
3. **Station Officer**: Views data for their assigned station and district
4. **Tuk-Tuk Driver/Device**: Submits GPS location updates

---

## 2. Data Models

### 2.1 Administrative Boundaries

```
Province
- id (UUID)
- name (string)
- code (string)
- created_at
- updated_at

District
- id (UUID)
- province_id (FK)
- name (string)
- code (string)
- created_at
- updated_at

PoliceStation
- id (UUID)
- district_id (FK)
- name (string)
- code (string)
- location (coordinates)
- created_at
- updated_at
```

### 2.2 Vehicle & Driver Management

```
Vehicle/TukTuk
- id (UUID)
- registration_number (string) - UNIQUE
- device_id (string) - UNIQUE (for GPS tracking)
- driver_id (FK)
- status (active/inactive)
- created_at
- updated_at

Driver
- id (UUID)
- name (string)
- license_number (string) - UNIQUE
- contact_number (string)
- vehicle_id (FK)
- created_at
- updated_at
```

### 2.3 Location Tracking

```
LocationPing
- id (UUID)
- vehicle_id (FK)
- latitude (decimal)
- longitude (decimal)
- timestamp
- accuracy (meters)
- speed (km/h)
- heading (degrees)
- created_at

LastKnownLocation
- id (UUID)
- vehicle_id (FK)
- latitude (decimal)
- longitude (decimal)
- timestamp
- updated_at
```

### 2.4 User Management

```
User
- id (UUID)
- username (string) - UNIQUE
- email (string) - UNIQUE
- password_hash (string)
- role (admin/provincial_admin/station_officer)
- assigned_station_id (FK) - nullable, null for admins
- assigned_district_id (FK) - nullable
- assigned_province_id (FK) - nullable
- is_active (boolean)
- created_at
- updated_at
```

---

## 3. RESTful API Endpoints

### 3.1 Authentication Endpoints

```
POST   /api/v1/auth/login              - User login
POST   /api/v1/auth/logout             - User logout
POST   /api/v1/auth/refresh-token      - Refresh JWT token
```

### 3.2 Provinces Endpoints

```
GET    /api/v1/provinces               - List all provinces
GET    /api/v1/provinces/:id           - Get province details
POST   /api/v1/provinces               - Create province (Admin only)
PUT    /api/v1/provinces/:id           - Update province (Admin only)
DELETE /api/v1/provinces/:id           - Delete province (Admin only)
```

### 3.3 Districts Endpoints

```
GET    /api/v1/districts               - List all districts (with filters)
GET    /api/v1/districts/:id           - Get district details
GET    /api/v1/provinces/:id/districts - List districts by province
POST   /api/v1/districts               - Create district (Admin only)
PUT    /api/v1/districts/:id           - Update district (Admin only)
DELETE /api/v1/districts/:id           - Delete district (Admin only)
```

### 3.4 Police Stations Endpoints

```
GET    /api/v1/police-stations         - List all stations (with filters)
GET    /api/v1/police-stations/:id     - Get station details
GET    /api/v1/districts/:id/stations  - List stations by district
POST   /api/v1/police-stations         - Create station (Admin only)
PUT    /api/v1/police-stations/:id     - Update station (Admin only)
DELETE /api/v1/police-stations/:id     - Delete station (Admin only)
```

### 3.5 Vehicles/Tuk-Tuks Endpoints

```
GET    /api/v1/vehicles                - List all vehicles (with filters)
GET    /api/v1/vehicles/:id            - Get vehicle details
GET    /api/v1/vehicles/:id/locations  - Get vehicle's historical locations
POST   /api/v1/vehicles                - Register new vehicle (Admin only)
PUT    /api/v1/vehicles/:id            - Update vehicle (Admin only)
DELETE /api/v1/vehicles/:id            - Deregister vehicle (Admin only)
```

### 3.6 Location Tracking Endpoints

```
POST   /api/v1/locations/ping          - Submit location update (Device/Driver)
GET    /api/v1/locations/latest        - Get latest locations of all vehicles
GET    /api/v1/locations/vehicle/:id   - Get latest location of specific vehicle
GET    /api/v1/locations/history       - Get historical locations (with filters)
GET    /api/v1/locations/search        - Search locations by province/district/time-window
```

### 3.7 Users Endpoints

```
GET    /api/v1/users                   - List users (Admin only)
GET    /api/v1/users/:id               - Get user details
POST   /api/v1/users                   - Create user (Admin only)
PUT    /api/v1/users/:id               - Update user (Admin only)
DELETE /api/v1/users/:id               - Delete user (Admin only)
```

### 3.8 Drivers Endpoints

```
GET    /api/v1/drivers                 - List drivers
GET    /api/v1/drivers/:id             - Get driver details
POST   /api/v1/drivers                 - Register driver (Admin only)
PUT    /api/v1/drivers/:id             - Update driver (Admin only)
DELETE /api/v1/drivers/:id             - Remove driver (Admin only)
```

---

## 4. Security & Authentication

### Authentication Strategy

- **JWT (JSON Web Tokens)** for API authentication
- Tokens include: user_id, role, assigned_station_id, assigned_province_id
- Token expiry: 1 hour (with refresh token mechanism)

### Authorization Strategy

- **Role-Based Access Control (RBAC)**
  - Admin: Full access to all endpoints
  - Provincial Admin: Access to their province's data
  - Station Officer: Access to their station's data
  - Device: Can only submit location pings

### Endpoint-Level Security

- Public: `/api/v1/auth/login`
- Device Only: `/api/v1/locations/ping`
- Authenticated Users: All other endpoints
- Admin Only: Create/Update/Delete operations on master data

---

## 5. API Response Standards

### Success Response (200, 201)

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    /* array of items */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 6. Database Technology

- **Primary DB**: MongoDB (for flexibility with location data)
- **Caching**: Redis (for latest vehicle locations)
- **Indexing Strategy**:
  - vehicle_id on LocationPing
  - timestamp on LocationPing
  - district_id + timestamp for filtered queries
  - device_id for quick device lookups

---

## 7. API Filtering & Querying

### Common Query Parameters

```
?page=1&limit=20                          - Pagination
?province_id=xxx                          - Filter by province
?district_id=xxx                          - Filter by district
?station_id=xxx                           - Filter by station
?start_date=2026-05-01&end_date=2026-05-08 - Time-window filtering
?status=active&status=inactive            - Multi-value filtering
```

---

## 8. Rate Limiting & Throttling

- Device endpoints: 1 request per 5 seconds (location updates)
- User endpoints: 100 requests per minute (per IP)
- Admin endpoints: 50 requests per minute

---

## 9. Deployment Considerations

- API deployed on cloud platform (Azure/AWS/Heroku)
- HTTPS enforced
- API versioning (/api/v1/)
- CORS enabled for authorized domains
- Request logging and monitoring

---

## 10. Simulation Data Requirements

- **9 Provinces** with realistic names
- **25 Districts** distributed across provinces
- **20+ Police Stations** mapped to districts
- **200+ Registered Tuk-Tuks** with active tracking
- **1 Week+ Historical Data** with realistic movement patterns
