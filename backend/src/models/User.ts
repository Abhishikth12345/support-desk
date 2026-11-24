
/* 1. User model review – User.ts
Good implementation
Your User model defines four roles:
export type UserRole =
    | "admin"
    | "manager"
    | "agent"
    | "customer";


This is a TypeScript union type.

It restricts your TypeScript code to these four role values.

Your schema also has:
Field	Purpose	Your implementation
name	User's name	Required
email	User's email	Required, unique
password	Hashed password	Required, minimum 8 characters
role	User permissions category	Defaults to customer
isActive	Account status	Defaults to true
createdAt	Creation timestamp	Automatic
updatedAt	Last update	Automatic

One particularly good decision
password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
}


select: false means Mongoose excludes the password field from normal query results.

But during login, you explicitly retrieve it:
const user = await User.findOne({
    email: normalizedEmail,
}).select("+password");


This is a good security practice. */



import mongoose, { Schema, Document } from "mongoose";

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
const userSchema = new Schema<IUser>(
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
