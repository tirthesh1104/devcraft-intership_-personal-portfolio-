# Pulse Chat — Real-time Chat App

A responsive multi-user chat application built with **Node.js, Express, and Socket.IO**. It supports instant message broadcasting, online users, typing indicators, join/leave notices, and recent message history while the server is running.

## Features

- Real-time messaging across connected browser tabs and devices
- Unique display names for users in the same server session
- Live online user list and online count
- Typing indicators
- Join/leave system notices
- Recent in-memory message history (up to 100 messages)
- Responsive dark UI for desktop and mobile
- Safe text rendering and basic message/name length limits

## Requirements

- Node.js 18 or later
- npm

## Run locally

1. Extract the ZIP and open a terminal in the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm run dev
   ```

   Or use `npm start` for a normal start.

4. Open **http://localhost:3000** in your browser.
5. Open the same URL in two or more tabs, join with different display names, and send messages to test real-time broadcasting and typing indicators.

## Project structure

```text
fennark-realtime-chat/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Socket.IO events

| Event | Direction | Purpose |
|---|---|---|
| `user:join` | Client → Server | Join using a display name |
| `user:joined` | Server → Client | Confirm the chosen display name |
| `users:update` | Server → All clients | Refresh the online user list |
| `chat:message` | Both ways | Send and broadcast a message |
| `chat:history` | Server → Client | Send recent messages on connection |
| `typing:start` / `typing:stop` | Client → Server | Share typing state |
| `typing:update` | Server → Other clients | Update typing indicator |
| `system:message` | Server → All clients | Show join/leave notices |

## Deploy

Deploy to a Node.js hosting provider that supports persistent WebSocket connections (for example, Render or Railway). Set the service start command to `npm start`. The app reads the port from `process.env.PORT`.

## Push to GitHub

Create a new GitHub repository named `fennark-realtime-chat`, then run these commands from the project folder:

```bash
git init
git add .
git commit -m "Build real-time chat app with Socket.IO"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/fennark-realtime-chat.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Do not commit `node_modules`.

## Submission

After pushing the project, submit your actual repository URL, for example:

`https://github.com/YOUR-USERNAME/fennark-realtime-chat`

**Note:** This ZIP contains the source project. You still need to install dependencies and test it locally, then upload it to your own GitHub account to obtain your real submission link.
