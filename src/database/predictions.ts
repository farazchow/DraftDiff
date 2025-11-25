import mongoose from "mongoose";

const predictionsSchema = new mongoose.Schema({
    userId: {
        type: Number,
        ref: "User",
        required: true
    },
    matchId: {
        type: Number,
        ref: "GameMatches"
    },
    amountBet: {
        type: Number,
        required: true
    },
    predictedWin: {
        type: Boolean,
        required: true
    },
    correctPrediction: Boolean,
    amountEarned: Boolean,
});

const predictionsModel = mongoose.model("Predictions", predictionsSchema);
export default predictionsModel;