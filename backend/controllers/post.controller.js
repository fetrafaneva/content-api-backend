import { Post } from "../models/user.model.js"; // on prend le Post de ton fichier unique

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
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // vérifier si l'utilisateur est l'auteur
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.remove();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
