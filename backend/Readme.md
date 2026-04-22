# Campus Event Management & Ticketing System API (v1)

## Overview

The Campus Event Management and Ticketing System is a comprehensive backend API that provides a centralized platform for managing campus events. It enables students to discover, register for, and attend events while providing organizers and administrators with powerful tools to manage the entire event lifecycle.

### Key Features

- **Event Discovery & Registration**: Students can browse upcoming events, view details, and register with digital tickets
- **QR Code Ticketing**: Generate and validate QR codes for secure event entry
- **Role-Based Access Control**: Separate interfaces for Students, Organizers, and Administrators
- **Event Management**: Create, approve, publish, and monitor events
- **Real-time Analytics**: Track registrations, check-ins, and participation metrics
- **Notification System**: Send updates and reminders to registered participants

## Architecture

### Tech Stack
- **Backend**: Node.js with Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code Generation**: qrcode library
- **Password Hashing**: bcrypt

### System Components
- **API Layer**: RESTful endpoints with standardized responses
- **Authentication Middleware**: JWT-based auth with role validation
- **Database Layer**: Prisma ORM for type-safe database operations
- **Business Logic**: Service layer for complex operations
- **Utilities**: QR generation, response formatting, JWT handling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (included with Prisma)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campus-event-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000/api/v1`

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

### Response Format
**Success Response:**
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

### API Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

#### User Management
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile

#### Event Management
- `POST /events` - Create new event (Organizer only)
- `GET /events` - List events with filtering/pagination
- `GET /events/my` - List events created by the authenticated organizer
- `GET /events/enrolled` - Get events user is enrolled in (Student only)
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event (Organizer only)
- `DELETE /events/:id` - Delete event (Organizer only)
- `PUT /events/:id/publish` - Publish event (Organizer only)

#### Registration
- `POST /events/:id/register` - Register for event (Student only)
- `DELETE /events/:id/register` - Cancel registration (Student only)
- `GET /registrations/me` - Get user's registrations (Student only)
- `GET /events/:id/participants` - Get event participants (Organizer/Admin)

#### Check-in System
- `POST /checkin` - Validate QR code (Organizer/Admin)
- `POST /checkin/confirm` - Confirm check-in (Organizer/Admin)

#### Notifications
- `POST /notifications` - Send notification (Organizer/Admin)
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read

#### Admin Functions
- `PUT /admin/events/:id/approve` - Approve event (Admin only)
- `PUT /admin/events/:id/reject` - Reject event (Admin only)
- `GET /admin/users` - Get all users (Admin only)
- `GET /admin/reports` - Get system reports (Admin only)

#### Analytics
- `GET /events/:id/stats` - Get event statistics (Organizer/Admin)

#### File Upload
- `POST /upload` - Upload files

For detailed API specifications, see [API_SPEC.md](docs/API_SPEC.md)

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  // Relations
  events       Event[]
  registrations Registration[]
  notifications Notification[]
}

enum Role {
  STUDENT
  ORGANIZER
  ADMIN
}
```

### Event Model
```prisma
model Event {
  id          String      @id @default(uuid())
  title       String
  description String
  date        DateTime
  venue       String
  organizerId String
  organizer   User        @relation(fields: [organizerId], references: [id])
  status      EventStatus @default(PENDING)
  capacity    Int?
  createdAt   DateTime    @default(now())
  // Relations
  registrations Registration[]
}

enum EventStatus {
  PENDING
  APPROVED
  REJECTED
  PUBLISHED
}
```

### Registration Model
```prisma
model Registration {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  ticketId  String   @unique @default(uuid())
  qrCode    String
  checkedIn Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Notification Model
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## User Roles & Permissions

| Role       | Permissions |
|------------|-------------|
| **Student** | - Browse and search events<br>- Register for events<br>- View personal registrations<br>- Receive notifications<br>- View profile |
| **Organizer** | - All Student permissions<br>- Create and manage own events<br>- View participant lists<br>- Send notifications<br>- Access event analytics<br>- Validate QR codes for check-in |
| **Admin** | - All Organizer permissions<br>- Approve/reject events<br>- View all users<br>- Generate system reports<br>- Access all event data |

## Testing

### Running Tests
```bash
npm test
```

### API Testing with Postman
Import the [Postman collection](docs/postman_collection.json) for comprehensive API testing.

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-production-jwt-secret"
PORT=3000
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Deploy
```bash
# Build for production
npm run build

# Deploy
npm run deploy
```

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@campus-events.com or join our Slack channel.

## Acknowledgments

- Express.js team for the amazing framework
- Prisma team for the excellent ORM
- QRCode library maintainers

---

**Version**: 1.0.0
**Last Updated**: April 18, 2026
