import mongoose, { Schema } from "mongoose";

export interface ICounter {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.model<ICounter>("Counter", counterSchema);

export default Counter;
