# TaskFlow — React Kanban Board

A responsive Kanban task board built with React and Vite. Organize tasks into **To Do**, **In Progress**, and **Done**.

## Features
- Three Kanban columns: To Do, In Progress, Done
- Drag and drop task cards between columns
- Move tasks with the status dropdown (keyboard/touch-friendly alternative)
- Create, edit, and delete tasks
- Task description, priority, category, assignee, and due date
- Search tasks and filter by priority
- Live task counts and completion progress
- Automatic persistence in browser `localStorage`
- Responsive desktop and mobile layout
- Sample tasks included

## Run locally
Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To verify persistence, create or move tasks, refresh the page, and confirm the board state remains saved in the same browser.

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```text
fennark-task-board/
├── index.html
├── package.json
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Push to GitHub
Create a new repository called `fennark-task-board`, then run these commands from this folder:

```bash
git init
git add .
git commit -m "Build React Kanban task board"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/fennark-task-board.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Submission
After uploading the code, submit your actual repository URL, for example:

`https://github.com/YOUR-USERNAME/fennark-task-board`

**Note:** This is the source project. Install and test it locally, then push it to your GitHub account to get the real submission link. The board persists in that browser using localStorage; it does not sync across different browsers or devices.
