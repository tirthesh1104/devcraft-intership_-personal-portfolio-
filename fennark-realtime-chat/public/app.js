const socket = io();
const messagesEl = document.getElementById("messages");
const userListEl = document.getElementById("user-list");
const onlineCountEl = document.getElementById("online-count");
const typingEl = document.getElementById("typing-indicator");
const welcomeEl = document.getElementById("welcome");
const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const charCount = document.getElementById("char-count");
const nameDialog = document.getElementById("name-dialog");
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const currentUserEl = document.getElementById("current-user");
const avatarEl = document.getElementById("avatar");
const toastEl = document.getElementById("toast");

let currentUsername = "";
let typingTimer;
let isTyping = false;
const typingUsers = new Set();
const renderedMessageIds = new Set();

function initials(name) {
  return (name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}
function timeLabel(value) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 2400);
}
function renderSystemMessage(message) {
  if (renderedMessageIds.has(message.id)) return;
  renderedMessageIds.add(message.id);
  const row = document.createElement("div");
  row.className = "system-message";
  const span = document.createElement("span");
  span.textContent = `${message.text} · ${timeLabel(message.time)}`;
  row.appendChild(span);
  messagesEl.appendChild(row);
  welcomeEl.hidden = true;
  scrollToBottom();
}
function renderMessage(message) {
  if (!message || renderedMessageIds.has(message.id)) return;
  renderedMessageIds.add(message.id);
  const row = document.createElement("article");
  row.className = "message-row";
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = initials(message.username);
  const main = document.createElement("div");
  main.className = "message-main";
  const meta = document.createElement("div");
  meta.className = "message-meta";
  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = message.username;
  if (message.username === currentUsername) name.style.color = "#b7adff";
  const time = document.createElement("time");
  time.className = "message-time";
  time.dateTime = message.time;
  time.textContent = timeLabel(message.time);
  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = message.text;
  meta.append(name, time);
  main.append(meta, text);
  row.append(avatar, main);
  messagesEl.appendChild(row);
  welcomeEl.hidden = true;
  scrollToBottom();
}
function updateUsers(users) {
  onlineCountEl.textContent = users.length;
  userListEl.replaceChildren();
  if (!users.length) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "No one online yet";
    userListEl.appendChild(empty);
    return;
  }
  users.forEach(user => {
    const li = document.createElement("li");
    const avatar = document.createElement("span");
    avatar.className = "user-avatar" + (user.username === currentUsername ? " self" : "");
    avatar.textContent = initials(user.username);
    const name = document.createElement("span");
    name.textContent = user.username + (user.username === currentUsername ? " (you)" : "");
    const dot = document.createElement("span");
    dot.className = "online-indicator";
    dot.title = "Online";
    li.append(avatar, name, dot);
    userListEl.appendChild(li);
  });
}
function updateTyping() {
  const names = [...typingUsers].filter(name => name !== currentUsername);
  typingEl.replaceChildren();
  if (!names.length) return;
  const dots = document.createElement("span");
  dots.className = "typing-dots";
  dots.innerHTML = "<i></i><i></i><i></i>";
  const text = document.createElement("span");
  text.textContent = names.length === 1 ? `${names[0]} is typing…` : `${names.slice(0, 2).join(" and ")} are typing…`;
  typingEl.append(dots, text);
}
function sendTypingStop() {
  if (isTyping) {
    isTyping = false;
    socket.emit("typing:stop");
  }
}
function joinWithName(name) {
  currentUsername = name.trim().slice(0, 24);
  if (!currentUsername) return;
  socket.emit("user:join", currentUsername);
}
function askForName() {
  nameInput.value = currentUsername;
  if (!nameDialog.open) nameDialog.showModal();
  nameInput.focus();
}

socket.on("connect", () => {
  if (currentUsername) socket.emit("user:join", currentUsername);
  else askForName();
});
socket.on("disconnect", () => showToast("Connection lost. Reconnecting…"));
socket.on("user:joined", ({ username }) => {
  currentUsername = username;
  currentUserEl.textContent = username;
  avatarEl.textContent = initials(username);
  nameDialog.close();
  updateTyping();
  input.focus();
});
socket.on("users:update", updateUsers);
socket.on("chat:history", history => history.forEach(renderMessage));
socket.on("chat:message", renderMessage);
socket.on("system:message", renderSystemMessage);
socket.on("typing:update", ({ username, isTyping: typing }) => {
  if (typing) typingUsers.add(username);
  else typingUsers.delete(username);
  updateTyping();
});

nameForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  joinWithName(name);
});
document.getElementById("change-name").addEventListener("click", askForName);
form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  socket.emit("chat:message", text);
  input.value = "";
  charCount.textContent = "0/500";
  sendTypingStop();
  input.focus();
});
input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length}/500`;
  if (input.value.trim() && !isTyping) {
    isTyping = true;
    socket.emit("typing:start");
  }
  window.clearTimeout(typingTimer);
  typingTimer = window.setTimeout(sendTypingStop, 1000);
});
input.addEventListener("blur", sendTypingStop);
document.getElementById("emoji-button").addEventListener("click", () => {
  input.value += " 😊";
  input.dispatchEvent(new Event("input"));
  input.focus();
});
