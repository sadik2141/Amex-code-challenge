# Event Management System - Production Ready

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## Quick Start

### Prerequisites

- Node.js v18+
- npm v9+

### Installation & Run & Build

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

Server runs on `http://localhost:3000`

### Build Output

The build command creates a `dist/` directory containing all production-ready files:

**Build Command Details:**

```bash
npm run build
```
This command:
- Creates a `./dist` directory in the project root
- Copies `services/` folder
- Copies `utils/` folder
- Copies `mock-server/` folder
- Copies `package.json`
- Ready for deployment to Docker or production servers
---

## Project Overview

This is an Event Management System that:

- Fetches users and events from external APIs
- Add events from external APIs

### Key Features

- Fast parallel request handling
- Circuit breaker pattern for fault tolerance
- Exponential backoff retry mechanism
- Proper error handling and HTTP status codes
- Structured logging

---

## API Endpoints

### GET /getUsers

Returns all users

```bash
curl http://localhost:3000/getUsers
```

**Response:**

```json
{
  "users": [
    {
      "userName": "user1",
      "id": 1,
      "email": "hello@gmail.com",
      "events": ["event-1", "event-3"]
    }
  ]
}
```

### GET /getEvents

Returns all events

```bash
curl http://localhost:3000/getEvents
```

**Response:**

```json
{
  "events": [
    {
      "id": 1768404724426,
      "name": "hello",
      "userId": "3",
      "email": "sadik@gmail.com"
    }
  ]
}
```

### GET /getEventsByUserId/:id

Returns events for a specific user (optimized with parallel requests)

```bash
curl http://localhost:3000/getEventsByUserId/2
```

**Response:**

```json
{
  "events": [
    {
      "id": 1,
      "name": "Event 2",
      "userId": 2,
      "details": "This is the first event"
    }
  ]
}
```

### POST /addEvent

Creates a new event with resilience protection

```bash
curl -X POST http://localhost:3000/addEvent \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hello",
    "userId":"3",
    "email": "sadik@gmail.com"
}'
```

**Response:**

```json
{
  "success": true
}
```

**Features:**

- Circuit breaker prevents overload
- Automatic retries with backoff
- Returns 503 if service is down

---

## Configuration

### Environment Variables

Create `.env` file:

```bash
NODE_ENV=production
PORT=3000
```

### Running in Development

```bash
npm start
```

---

## Deployment

### Prerequisites for Production

1. **Environment Setup**

   - Set `NODE_ENV=production`
   - Use environment-based configuration
   - Secure environment variables (AWS Secrets Manager, etc.)

2. **Monitoring & Logging**

   - Integrate with logging service (ELK Stack, Datadog, etc.)
   - Alert on repeated failures

3. **Docker Deployment**

   Build and run the Docker container:

   ```bash
   # Build the image
   docker build -t event-management-system:latest .

   # Run the container
   docker run -p 3000:3000 \
     -e NODE_ENV=production \
     event-management-system:latest
   ```

   **Dockerfile Features:**
   - Multi-stage build for smaller image size
   - Alpine base for efficiency
   - Health check endpoint
   - Production-ready environment variables
   - Automatic restart policy

4. **Database Migration**

   - Replace MSW mocks with real database

   ***
