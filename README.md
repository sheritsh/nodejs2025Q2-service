# Home Library Service

A REST API service for managing a personal music library, allowing users to manage artists, albums, tracks, and their favorites.

## Features

- **User Management**: Create, read, update, and delete users with password management
- **Artist Management**: CRUD operations for artists with Grammy information
- **Album Management**: CRUD operations for albums with artist associations
- **Track Management**: CRUD operations for tracks with artist and album associations
- **Favorites System**: Add/remove artists, albums, and tracks to/from favorites
- **Data Integrity**: Automatic cleanup of references when entities are deleted
- **Input Validation**: Request validation with proper error handling
- **UUID Generation**: All entities use UUID v4 for unique identification

## Prerequisites

- **Git** - [Download & Install Git](https://git-scm.com/downloads)
- **Node.js** - [Download & Install Node.js](https://nodejs.org/en/download/) (version >=22.14.0)
- **npm** - Comes with Node.js installation

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/%your-github-id%/nodejs2025Q2-service.git
   cd nodejs2025Q2-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```bash
   echo "PORT=4000" > .env
   ```
   
   Or manually create `.env` with:
   ```
   PORT=4000
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Standard Mode
```bash
npm start
```

The application will start on port 4000 (or the port specified in your `.env` file).

## API Documentation

### Base URL
```
http://localhost:4000
```

### Content Type
All requests and responses use `application/json`.

---

## User Management

### Get All Users
```http
GET /user
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "login": "username",
    "version": 1,
    "createdAt": 1672531200000,
    "updatedAt": 1672531200000
  }
]
```

### Get User by ID
```http
GET /user/:id
```

**Responses:**
- `200 OK` - User found
- `400 Bad Request` - Invalid UUID
- `404 Not Found` - User not found

### Create User
```http
POST /user
```

**Request Body:**
```json
{
  "login": "username",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "login": "username",
  "version": 1,
  "createdAt": 1672531200000,
  "updatedAt": 1672531200000
}
```

### Update User Password
```http
PUT /user/:id
```

**Request Body:**
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

**Responses:**
- `200 OK` - Password updated
- `400 Bad Request` - Invalid UUID
- `403 Forbidden` - Wrong old password
- `404 Not Found` - User not found

### Delete User
```http
DELETE /user/:id
```

**Responses:**
- `204 No Content` - User deleted
- `400 Bad Request` - Invalid UUID
- `404 Not Found` - User not found

---

## Artist Management

### Get All Artists
```http
GET /artist
```

### Get Artist by ID
```http
GET /artist/:id
```

### Create Artist
```http
POST /artist
```

**Request Body:**
```json
{
  "name": "Artist Name",
  "grammy": true
}
```

### Update Artist
```http
PUT /artist/:id
```

**Request Body:**
```json
{
  "name": "Updated Artist Name",
  "grammy": false
}
```

### Delete Artist
```http
DELETE /artist/:id
```

**Note:** Deleting an artist sets `artistId` to `null` in related albums and tracks, and removes the artist from favorites.

---

## Album Management

### Get All Albums
```http
GET /album
```

### Get Album by ID
```http
GET /album/:id
```

### Create Album
```http
POST /album
```

**Request Body:**
```json
{
  "name": "Album Name",
  "year": 2023,
  "artistId": "artist-uuid-or-null"
}
```

### Update Album
```http
PUT /album/:id
```

### Delete Album
```http
DELETE /album/:id
```

**Note:** Deleting an album sets `albumId` to `null` in related tracks and removes the album from favorites.

---

## Track Management

### Get All Tracks
```http
GET /track
```

### Get Track by ID
```http
GET /track/:id
```

### Create Track
```http
POST /track
```

**Request Body:**
```json
{
  "name": "Track Name",
  "duration": 180,
  "artistId": "artist-uuid-or-null",
  "albumId": "album-uuid-or-null"
}
```

### Update Track
```http
PUT /track/:id
```

### Delete Track
```http
DELETE /track/:id
```

**Note:** Deleting a track removes it from favorites.

---

## Favorites Management

### Get All Favorites
```http
GET /favs
```

**Response:** `200 OK`
```json
{
  "artists": [
    {
      "id": "uuid",
      "name": "Artist Name",
      "grammy": true
    }
  ],
  "albums": [
    {
      "id": "uuid",
      "name": "Album Name",
      "year": 2023,
      "artistId": "artist-uuid"
    }
  ],
  "tracks": [
    {
      "id": "uuid",
      "name": "Track Name",
      "duration": 180,
      "artistId": "artist-uuid",
      "albumId": "album-uuid"
    }
  ]
}
```

### Add to Favorites

**Add Artist:**
```http
POST /favs/artist/:id
```

**Add Album:**
```http
POST /favs/album/:id
```

**Add Track:**
```http
POST /favs/track/:id
```

**Responses:**
- `201 Created` - Added to favorites
- `400 Bad Request` - Invalid UUID
- `422 Unprocessable Entity` - Entity not found

### Remove from Favorites

**Remove Artist:**
```http
DELETE /favs/artist/:id
```

**Remove Album:**
```http
DELETE /favs/album/:id
```

**Remove Track:**
```http
DELETE /favs/track/:id
```

**Responses:**
- `204 No Content` - Removed from favorites
- `400 Bad Request` - Invalid UUID
- `404 Not Found` - Not in favorites

---

## Example Usage

### 1. Create an Artist
```bash
curl -X POST http://localhost:4000/artist \
  -H "Content-Type: application/json" \
  -d '{"name": "The Beatles", "grammy": true}'
```

### 2. Create an Album
```bash
curl -X POST http://localhost:4000/album \
  -H "Content-Type: application/json" \
  -d '{"name": "Abbey Road", "year": 1969, "artistId": "artist-uuid-here"}'
```

### 3. Create a Track
```bash
curl -X POST http://localhost:4000/track \
  -H "Content-Type: application/json" \
  -d '{"name": "Come Together", "duration": 259, "artistId": "artist-uuid", "albumId": "album-uuid"}'
```

### 4. Add Track to Favorites
```bash
curl -X POST http://localhost:4000/favs/track/track-uuid-here
```

### 5. Get All Favorites
```bash
curl http://localhost:4000/favs
```

---

## Project Structure

```
src/
├── interfaces/         # TypeScript interfaces
│   ├── user.interface.ts
│   ├── artist.interface.ts
│   ├── album.interface.ts
│   ├── track.interface.ts
│   └── favorites.interface.ts
├── dto/               # Data Transfer Objects with validation
│   ├── user.dto.ts
│   ├── artist.dto.ts
│   ├── album.dto.ts
│   └── track.dto.ts
├── database/          # In-memory database service
│   ├── database.service.ts
│   └── database.module.ts
├── user/              # User module
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── artist/            # Artist module
│   ├── artist.controller.ts
│   ├── artist.service.ts
│   └── artist.module.ts
├── album/             # Album module
│   ├── album.controller.ts
│   ├── album.service.ts
│   └── album.module.ts
├── track/             # Track module
│   ├── track.controller.ts
│   ├── track.service.ts
│   └── track.module.ts
├── favorites/         # Favorites module
│   ├── favorites.controller.ts
│   ├── favorites.service.ts
│   └── favorites.module.ts
├── app.module.ts      # Main application module
└── main.ts           # Application bootstrap
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Authorization
```bash
npm run test:auth
```

### Run Specific Test Suite
```bash
npm run test -- test/users.e2e.spec.ts
```

### Run Coverage
```bash
npm run test:cov
```

---

## Development

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Build
```bash
npm run build
```

### Development Mode with Watch
```bash
npm run start:dev
```

### Debug Mode
```bash
npm run start:debug
```

---

## Data Persistence

⚠️ **Important**: This application uses in-memory storage. All data will be lost when the application is restarted. This is intended for development and testing purposes.

---

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data or UUID format
- `403 Forbidden` - Authentication/authorization errors
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Entity doesn't exist (for favorites)

Error responses include descriptive messages:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

## OpenAPI Documentation

After starting the application, visit:
```
http://localhost:4000/doc/
```

For interactive API documentation and testing.

---

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Typed JavaScript
- **class-validator** - Decorator-based validation
- **uuid** - UUID generation
- **Jest** - Testing framework

---

## License

This project is licensed under the UNLICENSED license.
