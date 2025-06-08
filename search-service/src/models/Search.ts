import mongoose, { Schema, Document } from "mongoose";

export interface ISearch extends Document {
  userId: string;
  postId: string,
  content: string,
  createdAt: Date;
}

const SearchSchema: Schema = new mongoose.Schema(
  {
    postId:{
        type:String,
        required: true,
        unique:true
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

SearchSchema.index({content:'text'})
SearchSchema.index({createAt: -1})



export default mongoose.model<ISearch>("Search", SearchSchema);
