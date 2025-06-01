import mongoose,{ Document, Model } from "mongoose";
import argon2 from "argon2";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
    }, {
    timestamps: true,
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            const hashedPassword = await argon2.hash(this.password);
            this.password = hashedPassword;
        } catch (error:any) {
            return next(error);
        }
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error:any) {
        throw new Error("Password comparison failed");
    }
};

userSchema.index({ username: 'text'});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;