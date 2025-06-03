import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    publicId: string;
    originalName: String;
    userId: mongoose.Schema.Types.ObjectId;
    mimeType?: string;
    url: String;
}

const mediaSchema: Schema = new mongoose.Schema(
    {
        publicId: {
            type: String,
            required: true

        },
        originalName: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true }
);



export default mongoose.model<IMedia>('Media', mediaSchema);