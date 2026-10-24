# Fennark Project 5 — Social Media REST API

A REST API built with Node.js, Express, MongoDB/Mongoose, bcrypt password hashing, and JWT authentication.

## Features
- User registration and login
- Password hashing with bcrypt
- JWT-protected routes
- Create, list, read, update, and delete posts
- Like/unlike posts (one like per user)
- Input validation and consistent JSON error responses
- Ownership checks: users can update/delete only their own posts
- Postman collection included

## Requirements
- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas connection string

## Setup
1. Open this project folder in VS Code.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and replace `JWT_SECRET` with a long, random secret. Never commit `.env`.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Health check: `http://localhost:5000/api/health`

## API endpoints

### Authentication
- `POST /api/auth/register` — body `{ "name": "Demo User", "email": "demo@example.com", "password": "StrongPass123" }`
- `POST /api/auth/login` — body `{ "email": "demo@example.com", "password": "StrongPass123" }`
- `GET /api/auth/me` — authenticated; header `Authorization: Bearer YOUR_TOKEN`

### Posts
- `GET /api/posts` — list posts (public)
- `GET /api/posts/:id` — get post details (public)
- `POST /api/posts` — create post (authenticated)
- `PATCH /api/posts/:id` — update your own post (authenticated + owner)
- `DELETE /api/posts/:id` — delete your own post (authenticated + owner)

Create/update post body:
```json
{
  "title": "My first post",
  "content": "Hello! This is my first social media post."
}
```

### Likes
- `POST /api/posts/:id/like` — like a post (authenticated)
- `DELETE /api/posts/:id/like` — remove your like (authenticated)

A user can like a post only once. Response includes `likeCount` and `likedByMe` where appropriate.

## Postman flow
1. Register a user at `POST http://localhost:5000/api/auth/register`.
2. Copy the returned `token`.
3. For protected requests, set Authorization type to Bearer Token and paste the token.
4. Create a post with `POST /api/posts`.
5. List posts with `GET /api/posts`.
6. Like the post with `POST /api/posts/POST_ID/like`.
7. Try the unlike endpoint with `DELETE /api/posts/POST_ID/like`.
8. Verify that unauthenticated POST/PATCH/DELETE/like requests return `401`.

A Postman collection is included as `postman/Fennark-Social-Media-API.postman_collection.json`. Import it into Postman. After registration/login, set the collection variable `token` to the returned JWT. Set `postId` to a post's MongoDB `_id` for post and like requests.

## Submit to Fennark
Create a GitHub repository such as `fennark-social-media-api`, push the project files, and do not upload `.env` or `node_modules`. Test the endpoints in Postman, then paste your actual repository URL in the Project 5 submission box. Do not submit a fabricated URL.

This is a learning project, not a production-ready service. Before public production use, add rate limiting, stricter CORS configuration, logging/monitoring, refresh-token strategy, and deployment-specific security hardening.
