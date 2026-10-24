import { Router } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

function validId(id) {
  return mongoose.isValidObjectId(id);
}

function serializePost(post, currentUserId = null) {
  return {
    _id: post._id,
    title: post.title,
    content: post.content,
    author: post.author && typeof post.author === "object" && post.author.name
      ? { id: post.author._id, name: post.author.name }
      : post.author,
    likeCount: post.likes.length,
    likedByMe: currentUserId ? post.likes.some((id) => id.toString() === currentUserId.toString()) : false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

// Public feed
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find().populate("author", "name").sort({ createdAt: -1 });
    res.json(posts.map((post) => serializePost(post)));
  } catch {
    res.status(500).json({ message: "Unable to load posts." });
  }
});

router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json(serializePost(post));
  } catch {
    res.status(500).json({ message: "Unable to load post." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
  if (title.length < 3 || title.length > 120) {
    return res.status(400).json({ message: "Title must be between 3 and 120 characters." });
  }
  if (content.length < 1 || content.length > 10000) {
    return res.status(400).json({ message: "Content must be between 1 and 10,000 characters." });
  }
  try {
    const post = await Post.create({ author: req.user._id, title, content, likes: [] });
    await post.populate("author", "name");
    res.status(201).json(serializePost(post, req.user._id));
  } catch {
    res.status(500).json({ message: "Unable to create post." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
  const updates = {};
  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string" || req.body.title.trim().length < 3 || req.body.title.trim().length > 120) {
      return res.status(400).json({ message: "Title must be between 3 and 120 characters." });
    }
    updates.title = req.body.title.trim();
  }
  if (req.body.content !== undefined) {
    if (typeof req.body.content !== "string" || req.body.content.trim().length < 1 || req.body.content.trim().length > 10000) {
      return res.status(400).json({ message: "Content must be between 1 and 10,000 characters." });
    }
    updates.content = req.body.content.trim();
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: "Provide a title or content to update." });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own posts." });
    }
    Object.assign(post, updates);
    await post.save();
    await post.populate("author", "name");
    res.json(serializePost(post, req.user._id));
  } catch {
    res.status(500).json({ message: "Unable to update post." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted successfully." });
  } catch {
    res.status(500).json({ message: "Unable to delete post." });
  }
});

router.post("/:id/like", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!post.likes.some((id) => id.toString() === req.user._id.toString())) {
      post.likes.push(req.user._id);
      await post.save();
    }
    await post.populate("author", "name");
    res.json(serializePost(post, req.user._id));
  } catch {
    res.status(500).json({ message: "Unable to like post." });
  }
});

router.delete("/:id/like", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    await post.save();
    await post.populate("author", "name");
    res.json(serializePost(post, req.user._id));
  } catch {
    res.status(500).json({ message: "Unable to unlike post." });
  }
});

export default router;
