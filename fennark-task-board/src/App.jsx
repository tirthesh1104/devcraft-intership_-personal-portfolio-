import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowRight, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, Filter, LayoutGrid, ListTodo, MoreHorizontal,
  Plus, Search, Sparkles, Target, Trash2, X
} from "lucide-react";

const STORAGE_KEY = "taskflow-kanban-v1";
const columns = [
  { id: "todo", title: "To Do", subtitle: "Ideas & upcoming work", color: "violet", icon: ListTodo },
  { id: "progress", title: "In Progress", subtitle: "Currently working on", color: "blue", icon: Activity },
  { id: "done", title: "Done", subtitle: "Completed tasks", color: "green", icon: Check },
];
const initialTasks = [
  { id: "t1", title: "Plan the project roadmap", description: "Define milestones and priorities for the next sprint.", status: "todo", priority: "High", tag: "Planning", due: "2026-10-27", assignee: "TG" },
  { id: "t2", title: "Research user requirements", description: "Collect the key needs and turn them into clear tasks.", status: "todo", priority: "Medium", tag: "Research", due: "2026-10-29", assignee: "TG" },
  { id: "t3", title: "Create wireframe concepts", description: "Sketch the main views and confirm the layout.", status: "todo", priority: "Low", tag: "Design", due: "2026-10-31", assignee: "AK" },
  { id: "t4", title: "Build dashboard layout", description: "Set up responsive structure and reusable UI components.", status: "progress", priority: "High", tag: "Development", due: "2026-10-26", assignee: "TG" },
  { id: "t5", title: "Review component styles", description: "Check spacing, typography, and small-screen behavior.", status: "progress", priority: "Medium", tag: "Design", due: "2026-10-28", assignee: "RS" },
  { id: "t6", title: "Set up repository", description: "Initialize the project and organize the source files.", status: "done", priority: "Medium", tag: "Development", due: "2026-10-22", assignee: "TG" },
  { id: "t7", title: "Write project brief", description: "Document the goal, scope, and success criteria.", status: "done", priority: "Low", tag: "Planning", due: "2026-10-21", assignee: "AK" },
];

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTasks;
  } catch {
    return initialTasks;
  }
}
function prettyDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function isOverdue(value, status) {
  if (!value || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) < today;
}
function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "Medium", tag: "Development", due: "", assignee: "TG" });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch { setToast("Could not save board storage in this browser."); }
  }, [tasks]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const doneCount = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [task.title, task.description, task.tag, task.assignee].some((value) => (value || "").toLowerCase().includes(query));
    const matchesPriority = priorityFilter === "All priorities" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }), [tasks, search, priorityFilter]);

  function openNew(status = "todo") {
    setEditing(null);
    setForm({ title: "", description: "", status, priority: "Medium", tag: "Development", due: "", assignee: "TG" });
    setModal(true);
  }
  function openEdit(task) {
    setEditing(task.id);
    setForm({ title: task.title, description: task.description || "", status: task.status, priority: task.priority, tag: task.tag || "Development", due: task.due || "", assignee: task.assignee || "TG" });
    setModal(true);
  }
  function saveTask(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    if (editing) {
      setTasks((current) => current.map((task) => task.id === editing ? { ...task, ...form, title } : task));
      setToast("Task updated successfully");
    } else {
      setTasks((current) => [{ ...form, title, id: `task-${Date.now()}-${Math.random().toString(16).slice(2, 6)}` }, ...current]);
      setToast("New task added to your board");
    }
    setModal(false);
  }
  function moveTask(id, status) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task));
    setDraggedId(null);
    setDropTarget(null);
    setToast(`Task moved to ${columns.find((column) => column.id === status)?.title}`);
  }
  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setModal(false);
    setToast("Task deleted");
  }
  function clearBoard() {
    if (window.confirm("Reset the board to the original sample tasks? Your current board will be replaced.")) {
      setTasks(initialTasks);
      setSearch("");
      setPriorityFilter("All priorities");
      setToast("Board reset to sample tasks");
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><LayoutGrid size={21} strokeWidth={2.4} /></span>
          <span className="brand-name">taskflow<span>.</span><small>WORKSPACE</small></span>
        </a>
        <div className="workspace-picker">
          <div className="workspace-logo">P</div>
          <div className="workspace-label"><strong>Personal workspace</strong><span>Free plan</span></div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          <a className="nav-item active" href="#board"><LayoutGrid size={17} /> Board <span className="nav-count">{tasks.length}</span></a>
          <button className="nav-item" onClick={() => { setPriorityFilter("All priorities"); setSearch(""); }}><ListTodo size={17} /> All tasks</button>
          <button className="nav-item" onClick={() => setPriorityFilter("High")}><Target size={17} /> High priority</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card"><div className="tip-icon"><Sparkles size={16} /></div><strong>Make progress visible.</strong><p>Small steps add up. Keep your tasks moving forward.</p><div className="tip-progress"><span style={{ width: `${progress}%` }} /></div><small>{progress}% of tasks completed</small></div>
          <button className="help-button" onClick={() => setToast("Tip: drag a task card to another column, or use the move menu on each card.")}><CircleHelp size={17} /> Help & tips</button>
          <div className="user-profile"><div className="user-avatar">TG</div><div className="user-label"><strong>Tirthesh Gutte</strong><span>Workspace owner</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="main" id="board">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>My board</strong></div>
          <div className="top-actions"><span className="saved-label"><span className="saved-dot" /> Saved locally</span><button className="avatar-small" title="Your profile">TG</button></div>
        </header>
        <section className="board-heading">
          <div className="heading-left"><div className="eyebrow"><span className="eyebrow-dot" /> PERSONAL PROJECT</div><h1>My task board <span className="heading-emoji">✳</span></h1><p>Keep your work organized and make every day count.</p></div>
          <div className="heading-actions"><button className="secondary-button" onClick={clearBoard}><ArrowDown size={15} /> Reset demo</button><button className="primary-button" onClick={() => openNew()}><Plus size={17} /> Add task</button></div>
        </section>

        <section className="stats-row">
          <div className="stat-card"><div className="stat-icon stat-violet"><ListTodo size={17} /></div><div><span>Total tasks</span><strong>{tasks.length}</strong></div><div className="stat-side">On your board</div></div>
          <div className="stat-card"><div className="stat-icon stat-blue"><Activity size={17} /></div><div><span>In progress</span><strong>{tasks.filter((task) => task.status === "progress").length}</strong></div><div className="stat-side">Keep it moving</div></div>
          <div className="stat-card"><div className="stat-icon stat-green"><Check size={17} /></div><div><span>Completed</span><strong>{doneCount}</strong></div><div className="stat-side"><span className="mini-progress"><span style={{ width: `${progress}%` }} /></span>{progress}% done</div></div>
        </section>

        <div className="board-toolbar">
          <div className="board-label"><h2>Project tasks</h2><span className="task-total">{filteredTasks.length} tasks</span></div>
          <div className="toolbar-controls">
            <label className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks…" /></label>
            <label className="filter-box"><Filter size={14} /><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="Filter by priority"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={13} /></label>
          </div>
        </div>

        <section className="kanban-board" aria-label="Kanban board">
          {columns.map((column) => {
            const ColumnIcon = column.icon;
            const columnTasks = filteredTasks.filter((task) => task.status === column.id);
            return <section key={column.id} className={`kanban-column ${dropTarget === column.id ? "drop-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDropTarget(column.id); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null); }} onDrop={(event) => { event.preventDefault(); if (draggedId) moveTask(draggedId, column.id); }}>
              <header className="column-header">
                <div className={`column-icon ${column.color}`}><ColumnIcon size={16} /></div>
                <div className="column-heading-text"><h3>{column.title}</h3><span>{column.subtitle}</span></div>
                <span className={`column-count ${column.color}`}>{columnTasks.length}</span>
                <button className="column-add" onClick={() => openNew(column.id)} aria-label={`Add task to ${column.title}`}><Plus size={16} /></button>
              </header>
              <div className="task-list">
                {columnTasks.map((task) => <article key={task.id} className={`task-card ${draggedId === task.id ? "is-dragging" : ""}`} draggable onDragStart={(event) => { setDraggedId(task.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", task.id); }} onDragEnd={() => { setDraggedId(null); setDropTarget(null); }} onClick={() => openEdit(task)}>
                  <div className="task-card-top"><span className={`tag tag-${(task.tag || "development").toLowerCase().replace(/[^a-z]/g, "")}`}>{task.tag || "General"}</span><button className="task-menu" onClick={(event) => { event.stopPropagation(); openEdit(task); }} aria-label={`Edit ${task.title}`}><MoreHorizontal size={17} /></button></div>
                  <h4>{task.title}</h4>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-card-meta"><span className={`priority priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span><span className={`due-date ${isOverdue(task.due, task.status) ? "overdue" : ""}`}><CalendarDays size={12} />{prettyDate(task.due)}</span></div>
                  <div className="task-card-footer"><div className="assignee"><span className={`assignee-avatar avatar-${task.assignee || "TG"}`}>{task.assignee || "TG"}</span><span>{task.assignee === "TG" ? "Tirthesh" : task.assignee === "AK" ? "Aarav" : "Riya"}</span></div><label className="move-control" onClick={(event) => event.stopPropagation()}><ArrowRight size={13} /><select aria-label={`Move ${task.title}`} value={task.status} onChange={(event) => moveTask(task.id, event.target.value)}><option value="todo">To Do</option><option value="progress">In Progress</option><option value="done">Done</option></select></label></div>
                </article>)}
                {columnTasks.length === 0 && <div className="empty-column"><div className="empty-icon"><Clock3 size={18} /></div><strong>{search || priorityFilter !== "All priorities" ? "No matching tasks" : "Nothing here yet"}</strong><span>{search || priorityFilter !== "All priorities" ? "Try another search or filter." : "Drop a task here or create one."}</span>{!search && priorityFilter === "All priorities" && <button onClick={() => openNew(column.id)}><Plus size={14} /> Add a task</button>}</div>}
              </div>
              <button className="add-task-inline" onClick={() => openNew(column.id)}><Plus size={15} /> Add a task</button>
            </section>;
          })}
        </section>
        <footer className="board-footer"><span><span className="footer-dot" /> Changes save automatically in this browser</span><span>Built with <strong>React</strong> · TaskFlow</span></footer>
      </main>

      {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div><span className="modal-eyebrow">{editing ? "TASK DETAILS" : "NEW TASK"}</span><h2 id="modal-title">{editing ? "Edit task" : "Create a task"}</h2></div><button className="modal-close" onClick={() => setModal(false)} aria-label="Close dialog"><X size={19} /></button></header>
        <form onSubmit={saveTask} className="task-form">
          <label>Task title <span>*</span><input autoFocus required maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs to get done?" /></label>
          <label>Description <textarea rows="3" maxLength={400} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add a few details (optional)" /></label>
          <div className="form-grid"><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="todo">To Do</option><option value="progress">In Progress</option><option value="done">Done</option></select></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
          <div className="form-grid"><label>Category<select value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })}><option>Development</option><option>Design</option><option>Planning</option><option>Research</option><option>Marketing</option><option>General</option></select></label><label>Due date<input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} /></label></div>
          <label>Assignee<select value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })}><option value="TG">Tirthesh Gutte</option><option value="AK">Aarav Kumar</option><option value="RS">Riya Shah</option></select></label>
          <div className="modal-actions">{editing && <button type="button" className="delete-button" onClick={() => deleteTask(editing)}><Trash2 size={15} /> Delete</button>}<button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="primary-button"><Check size={16} /> {editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </section></div>}
      {toast && <div className="toast"><Check size={15} />{toast}</div>}
    </div>
  );
}
export default App;