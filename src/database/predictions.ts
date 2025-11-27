import mongoose from "mongoose";

const predictionsSchema = new mongoose.Schema({
  userId: {
    type: Number,
    ref: "User",
    required: true,
  },
  matchId: {
    type: String,
    ref: "GameMatches",
  },
  amountBet: {
    type: Number,
    required: true,
  },
  prediction: {
    type: String,
    enum: ["Win", "Loss"],
    required: true,
  },
  outcome: {
    type: String,
    enum: ["Win", "Loss", "Remake"],
    required: true,
  },
  amountEarned: {
    type: Number,
    required: true,
  },
});

const predictionsModel = mongoose.model("Predictions", predictionsSchema);
export default predictionsModel;
