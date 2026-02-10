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
