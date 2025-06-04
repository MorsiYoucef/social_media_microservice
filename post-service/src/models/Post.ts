import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    user: object;
    content: string;
    mediaIds?: string;
    likes: string[];
    createdAt: Date;
}

const PostSchema: Schema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content:
        {
            type: String,
            required: true
        },
        mediaIds: {
            type: String
        },
        likes:
        {
            type: [String],
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    },
    { timestamps: true }
);

PostSchema.index({ content: 'text' });

// ?because we will have diffrent service for search
const Post = mongoose.model<IPost>('Post', PostSchema);

export default Post;

