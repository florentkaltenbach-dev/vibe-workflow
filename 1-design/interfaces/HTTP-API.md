# HTTP API Contract

## Base URL
```
http://localhost:3000
```

---

## Static File Serving

### `GET /`
Serve main application HTML page.

**Response:**
- **Status:** 200 OK
- **Content-Type:** text/html
- **Body:** index.html

---

### `GET /assets/*`
Serve static assets (CSS, JS, images).

**Response:**
- **Status:** 200 OK
- **Content-Type:** Appropriate MIME type
- **Body:** File contents

**Error Response:**
- **Status:** 404 Not Found (if file doesn't exist)

---

## API Endpoints

### `GET /api/status`
Get server status and game information.

**Response:**
```typescript
{
  status: 'ok',
  gameActive: boolean,
  playerCount: number,
  maxPlayers: number,
  serverVersion: string
}
```

**Status:** 200 OK

**Example:**
```json
{
  "status": "ok",
  "gameActive": true,
  "playerCount": 3,
  "maxPlayers": 4,
  "serverVersion": "1.0.0"
}
```

---

### `GET /api/dictionary/check/:word`
Check if a word exists in the dictionary (for debugging/testing).

**Parameters:**
- `word` (path parameter): Word to check (case-insensitive)

**Response:**
```typescript
{
  word: string,
  valid: boolean
}
```

**Status:** 200 OK

**Example:**
```
GET /api/dictionary/check/hello

Response:
{
  "word": "HELLO",
  "valid": true
}
```

**Note:** This endpoint is optional and primarily for testing. Production game uses WebSocket for word validation.

---

## Error Responses

All API errors follow this format:

```typescript
{
  error: string,      // Error message
  code?: string,      // Optional error code
  details?: any       // Optional additional details
}
```

### Standard HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request succeeded |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server overloaded/maintenance |

---

## CORS Headers

For local development, server should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Note:** For production deployment beyond localhost, CORS should be configured appropriately.

---

## Content-Type Headers

### Requests
- JSON endpoints: `Content-Type: application/json`

### Responses
- JSON: `Content-Type: application/json; charset=utf-8`
- HTML: `Content-Type: text/html; charset=utf-8`
- CSS: `Content-Type: text/css`
- JavaScript: `Content-Type: application/javascript`

---

## Rate Limiting

**MVP:** No rate limiting implemented.

**Future Consideration:**
- Max 60 requests per minute per IP
- Response header: `X-RateLimit-Remaining: {count}`
- Status 429 (Too Many Requests) when exceeded

---

## Health Check

### `GET /health`
Simple health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Status:** 200 OK

**Use Case:** For monitoring or container orchestration health checks.

---

## Notes

### Primary Communication Protocol
The HTTP API is minimal because **WebSocket (Socket.io) is the primary communication protocol** for all game interactions. HTTP is used only for:
1. Initial page load
2. Static asset serving
3. Server status checks
4. Optional utility endpoints

### Security
- All game actions authenticated via Socket.io connection ID
- No session cookies needed
- No authentication tokens (local network only)

### Future Extensions
If the application grows beyond local hosting:
- Authentication endpoints (`POST /api/auth/login`)
- Game room management (`GET /api/rooms`, `POST /api/rooms`)
- Player statistics (`GET /api/stats/:playerId`)
