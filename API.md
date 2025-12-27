# API Documentation

Complete API reference for ChatBoat backend endpoints.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Auth Endpoints](#auth-endpoints)
- [User Endpoints](#user-endpoints)
- [Conversation Endpoints](#conversation-endpoints)
- [Message Endpoints](#message-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Base URL

```
http://localhost:5000/api
```

For production, replace with your deployed backend URL.

---

## Authentication

Most endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

The token is obtained from the login or register endpoints and should be stored in the client's localStorage or sessionStorage.

---

## Auth Endpoints

### Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2025-12-28T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid input or user already exists
- `500`: Server error

---

### Login User

**Endpoint:** `POST /auth/login`

**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

**Error Responses:**
- `400`: Invalid email or password
- `404`: User not found
- `500`: Server error

---

### Google OAuth Authentication

**Endpoint:** `POST /auth/google-auth`

**Description:** Login or register using Google OAuth

**Request Body:**
```json
{
  "tokenId": "google_oauth_token",
  "email": "user@gmail.com",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@gmail.com",
    "fullName": "John Doe"
  }
}
```

**Error Responses:**
- `400`: Invalid token or credentials
- `500`: Server error

---

### Logout User

**Endpoint:** `POST /auth/logout`

**Description:** Logout user (token-based logout on client-side)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## User Endpoints

### Get Current User

**Endpoint:** `GET /users/me`

**Description:** Get authenticated user's profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2025-12-28T10:30:00Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (invalid or missing token)
- `404`: User not found
- `500`: Server error

---

### Update User Profile

**Endpoint:** `PUT /users/me`

**Description:** Update user profile information

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "fullName": "John Smith"
  }
}
```

**Error Responses:**
- `400`: Invalid input
- `401`: Unauthorized
- `409`: Email already in use
- `500`: Server error

---

## Conversation Endpoints

### Create Conversation

**Endpoint:** `POST /conversations`

**Description:** Create a new conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "AI Web Development Help"
}
```

**Response (201):**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "AI Web Development Help",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-12-28T10:35:00Z",
    "updatedAt": "2025-12-28T10:35:00Z",
    "messageCount": 0
  }
}
```

**Error Responses:**
- `400`: Invalid input
- `401`: Unauthorized
- `500`: Server error

---

### Get All Conversations

**Endpoint:** `GET /conversations`

**Description:** Get all conversations for authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of conversations (default: 20)
- `skip`: Number of conversations to skip for pagination (default: 0)
- `sort`: Sort order - `newest` or `oldest` (default: `newest`)

**Example:**
```
GET /conversations?limit=10&skip=0&sort=newest
```

**Response (200):**
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "AI Web Development Help",
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-12-28T10:35:00Z",
      "updatedAt": "2025-12-28T10:40:00Z",
      "messageCount": 5
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

---

### Get Conversation by ID

**Endpoint:** `GET /conversations/:id`

**Description:** Get a specific conversation with all its messages

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "AI Web Development Help",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-12-28T10:35:00Z",
    "updatedAt": "2025-12-28T10:40:00Z",
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "role": "user",
        "content": "How do I implement authentication in React?",
        "createdAt": "2025-12-28T10:35:30Z"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "role": "assistant",
        "content": "You can implement authentication in React using...",
        "createdAt": "2025-12-28T10:35:45Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Conversation not found
- `500`: Server error

---

### Update Conversation

**Endpoint:** `PUT /conversations/:id`

**Description:** Update conversation title or metadata

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title"
}
```

**Response (200):**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Title",
    "updatedAt": "2025-12-28T10:45:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid input
- `401`: Unauthorized
- `404`: Conversation not found
- `500`: Server error

---

### Delete Conversation

**Endpoint:** `DELETE /conversations/:id`

**Description:** Delete a conversation and all its messages

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Conversation not found
- `500`: Server error

---

## Message Endpoints

### Send Message

**Endpoint:** `POST /messages`

**Description:** Send a message and get AI response

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "conversationId": "507f1f77bcf86cd799439012",
  "content": "How do I center a div with CSS?"
}
```

**Response (201):**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "conversationId": "507f1f77bcf86cd799439012",
      "role": "user",
      "content": "How do I center a div with CSS?",
      "createdAt": "2025-12-28T10:50:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "conversationId": "507f1f77bcf86cd799439012",
      "role": "assistant",
      "content": "There are several ways to center a div...",
      "createdAt": "2025-12-28T10:50:15Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid input
- `401`: Unauthorized
- `404`: Conversation not found
- `429`: Rate limit exceeded
- `500`: Server error

---

### Get Conversation Messages

**Endpoint:** `GET /messages/:conversationId`

**Description:** Get all messages for a conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of messages (default: 50)
- `skip`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "conversationId": "507f1f77bcf86cd799439012",
      "role": "user",
      "content": "How do I center a div with CSS?",
      "createdAt": "2025-12-28T10:50:00Z"
    }
  ],
  "total": 15
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Conversation not found
- `500`: Server error

---

### Delete Message

**Endpoint:** `DELETE /messages/:id`

**Description:** Delete a specific message

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Message not found
- `500`: Server error

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_INPUT` | 400 | Missing or invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_ERROR` | 503 | External service (AI/Email) unavailable |

---

## Rate Limiting

- **Default limit**: 100 requests per 15 minutes per IP
- **Message sending**: 30 messages per hour per user
- **Headers returned**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640679000
  ```

---

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Conversation

```bash
curl -X POST http://localhost:5000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Conversation"
  }'
```

### Send Message

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "conversationId": "CONVERSATION_ID",
    "content": "Hello, how can I learn React?"
  }'
```

---

## WebSocket Events (Optional - if real-time features are added)

*To be documented when WebSocket functionality is added*

---

## API Versioning

Current API Version: **v1** (implicit in base URL)

Future versions will be indicated with `/api/v2/` in the URL.

---

## Support

- 📖 [Main README](README.md)
- 🔧 [Installation Guide](INSTALLATION.md)
- 🤝 [Contributing Guidelines](CONTRIBUTING.md)
- 💬 [Open an Issue](https://github.com/yourusername/chatboat/issues)

For API questions, please create an issue with the `api-docs` label.
