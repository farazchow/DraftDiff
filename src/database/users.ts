import mongoose from "mongoose";

export interface IUser {
  _id: number;
  discordName: string;
  currentPoints: number;
  riotIds: string[];
  lastRewarded: Date;
  stocks: Map<string, number>;
}

const userSchema = new mongoose.Schema<IUser>({
  _id: {
    type: Number,
    required: true,
  },
  discordName: {
    type: String,
    required: true,
  },
  currentPoints: {
    type: Number,
    required: true,
  },
  riotIds: [String],
  lastRewarded: {
    type: Date,
    required: true,
  },
  stocks: {
    type: Map,
    of: Number,
  }
});

const userModel = mongoose.model<IUser>("Users", userSchema);
export default userModel;
