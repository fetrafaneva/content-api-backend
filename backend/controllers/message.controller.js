import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { onlineUsers } from "../socket.js";

// ------------------ SEND MESSAGE ------------------
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Message vide" });
    }

    const attachments =
      req.files?.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/messages/${file.filename}`,
      })) || [];

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      attachments,
    });

    // socket.io temps réel
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("new_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ GET CONVERSATION ------------------
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID invalide" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "username")
      .populate("receiver", "username")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ GET INBOX ------------------
export const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.user._id,
    })
      .populate("sender", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("GET INBOX ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ MARK AS READ ------------------
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Message ID invalide" });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    // seul le receiver peut marquer comme lu
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // déjà lu → inutile de modifier
    if (message.isRead) {
      return res.status(200).json({ message: "Message déjà lu" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      message: "Message marqué comme lu",
      data: message,
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ COUNT UNREAD ------------------
export const countUnreadMessages = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      unreadCount: count,
    });
  } catch (error) {
    console.error("COUNT UNREAD ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ DELETE MESSAGE ------------------
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // vérifier l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Message ID invalide" });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    // sécurité : sender OU receiver uniquement
    const userId = req.user._id.toString();
    if (
      message.sender.toString() !== userId &&
      message.receiver.toString() !== userId
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await message.deleteOne();

    res.status(200).json({ message: "Message supprimé avec succès" });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ UPDATE MESSAGE ------------------
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Le message est requis" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Message ID invalide" });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    // seul l'expéditeur peut modifier
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // message déjà lu → interdit
    if (message.isRead) {
      return res
        .status(400)
        .json({ message: "Impossible de modifier un message lu" });
    }

    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();

    await message.save();

    res.status(200).json({
      message: "Message modifié avec succès",
      data: message,
    });
  } catch (error) {
    console.error("UPDATE MESSAGE ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ GET CONVERSATIONS ------------------
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // recuperer tous les messages de l'utilisateur
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username")
      .populate("receiver", "username");

    const conversationsMap = new Map();

    for (const msg of messages) {
      // determiner l'autre utilisateur
      const otherUser =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver
          : msg.sender;

      const otherUserId = otherUser._id.toString();

      // si la conversation existe deja on va ignorer (on garde le dernier message pour l'afficher en haut(pour le frontend))
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: {
            id: otherUser._id,
            username: otherUser.username,
          },
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // compter les messages non lus recus
      if (msg.receiver._id.toString() === userId.toString() && !msg.isRead) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    }

    res.status(200).json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ MARK CONVERSATION AS READ ------------------
export const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;

    // validation ObjectId
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const result = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    res.status(200).json({
      message: "Conversation marquée comme lue",
      updatedMessages: result.modifiedCount,
    });
  } catch (error) {
    console.error("MARK CONVERSATION READ ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
