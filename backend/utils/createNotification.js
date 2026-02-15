import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  user,
  fromUser,
  type,
  post,
  commentId,
}) => {
  // desactiver la notification pour soi-meme
  if (user.toString() === fromUser.toString()) return;

  await Notification.create({
    user,
    fromUser,
    type,
    post,
    commentId,
  });
};
