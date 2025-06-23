import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  media?: {
    url: string;
    public_id: string;
    type: "image" | "video";
  };
  createdAt: Date;
  read: boolean;
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    media: {
      url: String,
      public_id: String,
      enum: ["image", "video"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
