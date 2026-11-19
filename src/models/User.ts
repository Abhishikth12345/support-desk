import mongoose, { Schema, Document  } from "mongoose";

//1.Define allowed user roles
export type UserRole = 
| "admin"
| "manager"
| "agent"
| "customer"

//2. Define user structure
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

//3. Create the mongoose schema
const userSchema = new Schema<IUser> (
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },


        role: {
            type: String,
            enum: ["admin", "manager", "agent", "customer"],
            default: "customer"
        },

        isActive: {
            type: Boolean,
            default: true
        },
    }, 

        { 
            timestamps: true 
        }
);

//4. Create and export the User model

const User = mongoose.model<IUser>("User", userSchema);

export default User;
