import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
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

const User = mongoose.model("User", userSchema);
export default User;