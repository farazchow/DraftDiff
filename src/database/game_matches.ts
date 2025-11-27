import mongoose from "mongoose";

const gameMatchSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    usersPlaying: [
      {
        type: Number,
        ref: "User",
      },
    ],
    outcome: {
      type: String,
      enum: ["Win", "Loss", "Remake"],
    },
  },
  {
    timestamps: true,
  }
);

const gameMatchModel = mongoose.model("GameMatches", gameMatchSchema);
export default gameMatchModel;
