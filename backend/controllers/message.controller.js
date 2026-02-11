import mongoose from "mongoose";
import { Message } from "../models/message.model.js";

// ------------------ SEND MESSAGE ------------------
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Receiver ID invalide" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    res.status(201).json({
      message: "Message envoyé",
      data: message,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
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
