import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        required: true
    },
    riotIds: [String]
});

const userModel = mongoose.model("Users", userSchema);
export default userModel;