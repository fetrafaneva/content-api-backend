import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },

    // date de modification
    editedAt: {
      type: Date,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
      },
    ],

    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt = date d’envoi
  }
);

export const Message = mongoose.model("Message", messageSchema);
