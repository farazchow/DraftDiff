import { VoiceState } from "discord.js";
import userModel from "../database/users";
import { TransferPoints } from "../database/dbFunctions";

const REWARDTIME = 1000 * 60 * 15;
const REWARDAMOUNT = 1;
const usersInVoice: Map<string, number> = new Map();

export async function CheckVoice(old: VoiceState, current: VoiceState) {
  // Joined a new VC
  if (old.channelId === null && current.channelId !== null) {
    // Already Tracking
    if (usersInVoice.has(current.id)) {
      return;
    }

    // Start Tracking if User is registered
    if (await userModel.findById(Number(current.id))) {
      console.log("Now tracking: ", current.id);
      usersInVoice.set(current.id, Date.now());
    }
  }

  // User left VC
  if (
    old.channelId !== null &&
    current.channelId === null &&
    Date.now() - (usersInVoice.get(old.id) ?? Date.now()) >= REWARDTIME
  ) {
    const user = await userModel.findById(Number(old.id));
    const currentDate = new Date();
    // User hasn't gotten reward today
    if (
      user &&
      !(
        user.lastRewarded?.getUTCDate() === currentDate.getUTCDate() &&
        user.lastRewarded?.getUTCMonth() === currentDate.getUTCMonth()
      )
    ) {
      console.log(`${user.discordName} received points!`);
      user.lastRewarded = currentDate;
      TransferPoints(undefined, user._id, REWARDAMOUNT, "Daily Reward!");
      user.save();
    }
    usersInVoice.delete(old.id);
  }
}
