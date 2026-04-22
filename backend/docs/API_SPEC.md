###  Base URL
`/api/v1`

### Authentication
- Uses JWT (Bearer Token)
- Include in headers:
Authorization: Bearer <token>


### Standard Response Format

* Success
```
{
  "success": true,
  "data": {},
  "error": null
}
```

* Error
```
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

### AUTH APIs

#### Register

`POST /auth/register`

```
{
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "password": "123456",
  "role": "student"
}
```
---

#### Login
`POST /auth/login`
```
{
  "token": "jwt_token",
  "user": {
    "id": "user123",
    "role": "student"
  }
}
```
---

#### Get Current User
`GET /auth/me`

---

### USER APIs

#### Get Profile
`GET /users/:id`

#### Update Profile
`PUT /users/:id`

---

### EVENT APIs

#### Create Event
`POST /events`

#### Get All Events
`GET /events?status=approved&search=hackathon&page=1&limit=10`

#### Get My Enrolled Events
`GET /events/enrolled`

Returns all events the authenticated student is registered for, including registration details.

#### Get Organizer Events
`GET /events/my`

Returns all events created by the authenticated organizer, including registration counts.

#### Get Event Details
`GET /events/:id`

#### Update Event
`PUT /events/:id`

#### Delete Event
`DELETE /events/:id`

#### Publish Event
`PUT /events/:id/publish`

---

### REGISTRATION APIs

#### Register for Event
`POST /events/:id/register`
```
{
  "ticket_id": "abc123",
  "qr_code": "base64string"
}
```

#### Cancel Registration
`DELETE /events/:id/register`

#### Get My Registrations
`GET /registrations/me`

#### Get Participants (Organizer)
`GET /events/:id/participants`

---

### QR / CHECK-IN APIs

#### Validate QR
Request:
`POST /checkin`
```
{
  "ticket_id": "abc123"
}
```
Response:
```
{
  "status": "valid",
  "user": "Rahul",
  "event": "Hackathon"
}
```

### Confirm Check-in
`POST /checkin/confirm`

---

### NOTIFICATION APIs

#### Send Notification
`POST /notifications`

#### Get Notifications
`GET /notifications`

#### Mark as Read
`PUT /notifications/:id/read`

---

### ADMIN APIs

#### Approve Event
`PUT /admin/events/:id/approve`

#### Reject Event
`PUT /admin/events/:id/reject`

#### Get All Users
`GET /admin/users`

#### Get Reports
`GET /admin/reports`
```
{
  "total_events": 50,
  "total_registrations": 1200,
  "active_users": 300
}
```
---

### ANALYTICS APIs

#### Event Stats
`GET /events/:id/stats`
```
{
  "registrations": 120,
  "checkins": 90,
  "no_shows": 30
}
```
---

### FILE UPLOAD APIs (Optional)

#### Upload File
`POST /upload`

---

## ROLE-BASED ACCESS

| Role       | Permissions                  |
|------------|------------------------------|
| Student    | Browse, Register             |
| Organizer  | Create, Manage Events        |
| Admin      | Approve, Monitor, Reports    |

---

##  QUERY FEATURES

Supported query params:
- page, limit → Pagination
- search → Search events
- status → Filter events
- sort → Sorting

---

##  Development Guidelines

- Follow API contracts strictly
- Use feature-based Git branches:
  feature/auth
  feature/events
  feature/qr-system
- Do not change response formats without team agreement
