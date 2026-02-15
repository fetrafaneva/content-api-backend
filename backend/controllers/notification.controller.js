import { Notification } from "../models/notification.model.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .populate("fromUser", "username")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
