const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();

// Get all posts with comments populated
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post("/", async (req, res) => {
  const { userId, content } = req.body;
  try {
    const post = new Post({ user: userId, content });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to post
router.post("/:postId/comment", async (req, res) => {
  const { userId, text } = req.body;
  const { postId } = req.params;

  try {
    const comment = new Comment({ user: userId, post: postId, text });
    await comment.save();

    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
