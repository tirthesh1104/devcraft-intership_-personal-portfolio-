import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String, required: [true, "Title is required."], trim: true,
    minlength: [3, "Title must contain at least 3 characters."],
    maxlength: [120, "Title must be 120 characters or fewer."]
  },
  content: {
    type: String, required: [true, "Content is required."], trim: true,
    minlength: [10, "Content must contain at least 10 characters."],
    maxlength: [20000, "Content must be 20,000 characters or fewer."]
  }
}, { timestamps: true });

export default mongoose.model("Post", postSchema);
