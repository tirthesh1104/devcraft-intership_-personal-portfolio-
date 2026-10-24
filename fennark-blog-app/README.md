# Fennark Project 4 — Blog App

Full-stack blog app built with React, Express, and MongoDB.

## Features
- Create posts with a title and content
- List posts and open a detail view
- Search posts
- Delete posts
- Responsive design, input validation, loading and error states

## Requirements
- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas connection string

## Setup
1. In `server`, copy `.env.example` to `.env`.
2. Set `MONGODB_URI` in `server/.env`. Example local URI:
   `mongodb://127.0.0.1:27017/fennark_blog`
3. From the project root, run:
   ```bash
   npm install
   npm run install:all
   npm run dev
   ```
4. Open the frontend at `http://localhost:5173`.
5. API runs at `http://localhost:5000/api/posts`.

## API routes
- `GET /api/posts` — list posts
- `GET /api/posts/:id` — retrieve one post
- `POST /api/posts` — create post (`title`, `content`)
- `DELETE /api/posts/:id` — delete post

## Test with Postman
POST `http://localhost:5000/api/posts`, header `Content-Type: application/json`, body:
```json
{ "title": "My First Blog", "content": "This is my first blog post." }
```

## GitHub submission
Create a GitHub repository named `fennark-blog-app`, upload/push the project files, and do not commit `.env` or `node_modules`. Test the app, then submit your actual repository URL in the Fennark Project 4 box. Do not submit a made-up URL.

This starter is configured for local development. Public deployment requires deploying both frontend and backend and setting the frontend API URL and CORS for the deployed domains.
