import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema(
  {
    sender: {
      type: Number,
      ref: "Users",
    },
    receiver: {
      type: Number,
      ref: "Users",
    },
    amount: {
      type: Number,
      required: true,
    },
    note: String,
  },
  {
    timestamps: true,
  }
);

const transactionsModel = mongoose.model("Transactions", transactionsSchema);
export default transactionsModel;
