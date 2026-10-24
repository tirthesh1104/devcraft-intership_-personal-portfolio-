import { Router } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).select("title content createdAt updatedAt");
    res.json(posts);
  } catch {
    res.status(500).json({ message: "Unable to load posts." });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json(post);
  } catch {
    res.status(500).json({ message: "Unable to load this post." });
  }
});

router.post("/", async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
  if (title.length < 3 || title.length > 120) {
    return res.status(400).json({ message: "Title must be between 3 and 120 characters." });
  }
  if (content.length < 10 || content.length > 20000) {
    return res.status(400).json({ message: "Content must be between 10 and 20,000 characters." });
  }
  try {
    const post = await Post.create({ title, content });
    res.status(201).json(post);
  } catch {
    res.status(500).json({ message: "Unable to create post." });
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json({ message: "Post deleted successfully." });
  } catch {
    res.status(500).json({ message: "Unable to delete post." });
  }
});
export default router;
