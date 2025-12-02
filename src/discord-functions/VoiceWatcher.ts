import { VoiceState } from "discord.js";
import userModel from "../database/users";
import { TransferPoints } from "../database/dbFunctions";

const REWARDTIME = 1000 * 60 * 15;
const REWARDAMOUNT = 50;
const usersInVoice: Map<number, NodeJS.Timeout> = new Map();

export async function CheckVoice(old: VoiceState, current: VoiceState) {
  // Joined a new VC
  if (old.channelId === null && current.channelId !== null) {
    const currentID = Number(current.id);

    // Already Tracking
    if (usersInVoice.has(currentID)) {
      return;
    }

    // Start Tracking if User is registered
    if (await userModel.findById(currentID)) {
      console.log("Now tracking: ", currentID);
      const timeout = setTimeout(() => RewardUser(currentID), REWARDTIME);
      usersInVoice.set(currentID, timeout);
    }
  }

  const oldID = Number(old.id);
  // User left VC
  if (
    old.channelId !== null &&
    current.channelId === null &&
    usersInVoice.get(oldID)
  ) {
    usersInVoice.get(oldID)?.close();
    usersInVoice.delete(oldID);
  }
}

async function RewardUser(id: number) {
  const user = await userModel.findById(Number(id));
  const currentDate = new Date();

  // User hasn't gotten reward today
  if (user && 
    !(user.lastRewarded?.getUTCDate() === currentDate.getUTCDate() &&
    user.lastRewarded?.getUTCMonth() === currentDate.getUTCMonth())) 
  {
    console.log(`${user.discordName} received points!`);
    user.lastRewarded = currentDate;
    TransferPoints(undefined, user._id, REWARDAMOUNT, "Daily Reward!");
    user.save();
  }
  usersInVoice.get(id)?.close();
  usersInVoice.delete(id);
}