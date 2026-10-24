import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const formatDate = (value) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
const excerpt = (text, max = 155) => text.length > max ? `${text.slice(0, max).trim()}…` : text;

export default function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  async function loadPosts() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load posts.");
      setPosts(data);
    } catch {
      setError("Could not connect to the API. Check that MongoDB and the Express server are running.");
    } finally { setLoading(false); }
  }
  useEffect(() => { loadPosts(); }, []);

  const visiblePosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? posts.filter((post) => `${post.title} ${post.content}`.toLowerCase().includes(term)) : posts;
  }, [posts, search]);

  async function createPost(event) {
    event.preventDefault(); setError(""); setNotice("");
    if (title.trim().length < 3) return setError("Title must contain at least 3 characters.");
    if (content.trim().length < 10) return setError("Content must contain at least 10 characters.");
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not publish the post.");
      setPosts((current) => [data, ...current]); setTitle(""); setContent("");
      setSelectedPost(data); setNotice("Your post has been published.");
    } catch (err) { setError(err.message || "Could not publish the post."); }
    finally { setSaving(false); }
  }

  async function deletePost(postId) {
    if (!window.confirm("Delete this blog post?")) return;
    setError(""); setNotice("");
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete post.");
      setPosts((current) => current.filter((post) => post._id !== postId));
      if (selectedPost?._id === postId) setSelectedPost(null);
      setNotice("Post deleted.");
    } catch (err) { setError(err.message || "Could not delete post."); }
  }

  function showHome() { setSelectedPost(null); setError(""); setNotice(""); }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); showHome(); }}><span className="brand-mark">i</span> inkspace<span className="brand-dot">.</span></a>
      <nav className="top-actions"><a href="#write" onClick={showHome}>Write a post</a><span className="avatar" aria-label="Blog reader">TG</span></nav>
    </header>
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="kicker"><span className="kicker-line" /> A SPACE FOR YOUR IDEAS</p>
          <h1>Stories worth<br /><em>sharing.</em></h1>
          <p className="hero-copy">A simple home for thoughts, lessons, and ideas. Write something new or explore the latest posts.</p>
          <a className="hero-button" href="#write" onClick={showHome}>Start writing <span>↗</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-sun" /><div className="art-sheet sheet-back" />
          <div className="art-sheet sheet-front"><div className="sheet-label">FIELD NOTES / 001</div><div className="sheet-title">Ideas grow<br />when shared.</div><div className="sheet-lines"><i /><i /><i /><i /></div><div className="sheet-stamp">WRITE<br />MORE</div></div>
          <div className="art-spark">✳</div>
        </div>
      </section>
      <section className="content-layout">
        <div className="feed-column">
          <div className="section-top"><div><p className="small-label">THE JOURNAL</p><h2>{selectedPost ? "Post details" : "Latest stories"}</h2></div>{selectedPost && <button className="text-button" onClick={showHome}>← All posts</button>}</div>
          {error && <div className="alert error-alert" role="alert">{error}</div>}
          {notice && <div className="alert success-alert" role="status">{notice}</div>}
          {selectedPost ? <article className="detail-card">
            <p className="post-date">{formatDate(selectedPost.createdAt)}</p><h3 className="detail-title">{selectedPost.title}</h3>
            <div className="detail-content">{selectedPost.content}</div>
            <div className="detail-footer"><span>Written for the curious.</span><button className="delete-button" onClick={() => deletePost(selectedPost._id)}>Delete post</button></div>
          </article> : loading ? <div className="empty-state"><div className="loader" /><p>Loading stories…</p></div>
          : visiblePosts.length === 0 ? <div className="empty-state"><div className="empty-icon">✎</div><h3>{search ? "No matching stories" : "Your first story starts here."}</h3><p>{search ? "Try a different search term." : "Use the editor to publish the first post to your journal."}</p></div>
          : <div className="post-list">{visiblePosts.map((post, index) => <article className="post-card" key={post._id}>
            <div className={`post-number tone-${index % 3}`}>{String(index + 1).padStart(2, "0")}</div>
            <div className="post-main"><div className="post-meta"><span>{formatDate(post.createdAt)}</span><span className="meta-dot">·</span><span>Journal entry</span></div>
              <button className="post-title-button" onClick={() => { setSelectedPost(post); setNotice(""); }}><h3>{post.title}</h3></button>
              <p className="post-excerpt">{excerpt(post.content)}</p>
              <button className="read-link" onClick={() => { setSelectedPost(post); setNotice(""); }}>Read story <span>→</span></button>
            </div>
            <button className="icon-delete" title="Delete post" aria-label={`Delete ${post.title}`} onClick={() => deletePost(post._id)}>×</button>
          </article>)}</div>}
        </div>
        <aside className="sidebar">
          <div className="search-box"><label htmlFor="searchPosts">Find a story</label><div className="search-input"><span>⌕</span><input id="searchPosts" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" /></div></div>
          <div className="write-card" id="write"><p className="small-label">YOUR TURN</p><h2>Put your thoughts into words.</h2><p>Every good post begins with a blank page. Start yours here.</p>
            <form onSubmit={createPost}>
              <label htmlFor="postTitle">Title</label><input id="postTitle" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} minLength={3} required placeholder="Give your post a title" /><div className="field-hint">{title.length}/120 characters</div>
              <label htmlFor="postContent">Content</label><textarea id="postContent" value={content} onChange={(e) => setContent(e.target.value)} minLength={10} maxLength={20000} required rows={6} placeholder="What would you like to share?" /><div className="field-hint">{content.length} characters · minimum 10</div>
              <button className="publish-button" type="submit" disabled={saving}>{saving ? "Publishing…" : "Publish story"} <span>↗</span></button>
            </form>
          </div>
          <div className="sidebar-note"><span>✳</span><p><strong>Good ideas deserve a home.</strong><br />Write clearly. Stay curious. Keep sharing.</p></div>
        </aside>
      </section>
    </main>
    <footer className="footer"><a className="brand" href="#" onClick={(e) => { e.preventDefault(); showHome(); }}><span className="brand-mark">i</span> inkspace<span className="brand-dot">.</span></a><p>Built with React, Express & MongoDB.</p><span>© {new Date().getFullYear()} Inkspace</span></footer>
  </div>;
}
