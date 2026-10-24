const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const users = new Map();
const recentMessages = [];
const MAX_MESSAGES = 100;

function publicUsers() {
  return Array.from(users.values()).map(({ username }) => ({ username }));
}

function cleanText(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

io.on("connection", (socket) => {
  socket.emit("chat:history", recentMessages);

  socket.on("user:join", (rawName) => {
    if (users.has(socket.id)) return;
    let username = cleanText(rawName, 24).replace(/[<>]/g, "");
    if (!username) username = `Guest${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = new Set(Array.from(users.values()).map((user) => user.username.toLowerCase()));
    const baseName = username;
    let suffix = 2;
    while (existing.has(username.toLowerCase())) {
      username = `${baseName.slice(0, 20)}${suffix++}`;
    }

    users.set(socket.id, { username });
    socket.emit("user:joined", { username });
    io.emit("users:update", publicUsers());
    io.emit("system:message", {
      id: `sys-${Date.now()}-${socket.id.slice(0, 5)}`,
      text: `${username} joined the chat`,
      time: new Date().toISOString()
    });
  });

  socket.on("chat:message", (rawText) => {
    const user = users.get(socket.id);
    const text = cleanText(rawText, 500);
    if (!user || !text) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      username: user.username,
      text,
      time: new Date().toISOString()
    };
    recentMessages.push(message);
    if (recentMessages.length > MAX_MESSAGES) recentMessages.shift();
    io.emit("chat:message", message);
  });

  socket.on("typing:start", () => {
    const user = users.get(socket.id);
    if (user) socket.broadcast.emit("typing:update", { username: user.username, isTyping: true });
  });

  socket.on("typing:stop", () => {
    const user = users.get(socket.id);
    if (user) socket.broadcast.emit("typing:update", { username: user.username, isTyping: false });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.emit("typing:update", { username: user.username, isTyping: false });
      io.emit("users:update", publicUsers());
      io.emit("system:message", {
        id: `sys-${Date.now()}-${socket.id.slice(0, 5)}`,
        text: `${user.username} left the chat`,
        time: new Date().toISOString()
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Real-time chat is running at http://localhost:${PORT}`);
});