import { Post } from "../models/user.model.js"; // on prend le Post de ton fichier unique
import mongoose from "mongoose";

// ------------------ CREATE POST ------------------
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // req.user sera défini par le middleware auth
    const post = await Post.create({ title, content, author: req.user._id });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ GET ALL POSTS ------------------
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email") // pour voir qui a posté
      .sort({ createdAt: -1 }); // posts récents en premier

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ DELETE POST ------------------
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // Trouver le post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Vérifier si l'utilisateur est l'auteur du post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Action non autorisée : vous n'êtes pas l'auteur du post",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      message: "Post supprimé avec succès",
      postId: id,
    });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ UPDATE POST ------------------
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;

    await post.save();
    res.status(200).json({ message: "Post mis à jour", post });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ GET POST BY ID ------------------
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const post = await Post.findById(id).populate("author", "username");

    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ LIKE / UNLIKE POST ------------------
export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // unlike
      post.likes.pull(userId);
    } else {
      // like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ ADD COMMENT ------------------
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      content,
    });

    await post.save();

    res.status(201).json({ message: "Comment added", comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ REPLY TO COMMENT ------------------
export const replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Reply content required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies.push({
      user: req.user._id,
      content,
    });

    await post.save();

    res.status(201).json({
      message: "Reply added",
      replies: comment.replies,
    });
  } catch (error) {
    console.error("REPLY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ UPDATE REPLY ------------------
export const updateReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // sécurité : seul l'auteur peut modifier
    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    reply.content = content;
    reply.edited = true;
    reply.editedAt = new Date();

    await post.save();

    res.status(200).json({ message: "Reply updated", reply });
  } catch (error) {
    console.error("UPDATE REPLY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ DELETE REPLY ------------------
export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // sécurité
    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    reply.deleteOne();
    await post.save();

    res.status(200).json({ message: "Reply deleted" });
  } catch (error) {
    console.error("DELETE REPLY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
