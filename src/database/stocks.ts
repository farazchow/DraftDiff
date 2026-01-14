import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    ESTC: {type: Number, required: true},
    TEN: {type: Number, required: true},
    PHF: {type: Number, required: true},
    MIT: {type: Number, required: true},
  },
  {
    timestamps: true,
  }
);

const stockModel = mongoose.model("Stocks", stockSchema);
export default stockModel;
