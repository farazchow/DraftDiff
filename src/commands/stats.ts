import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import userModel from "../database/users";

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Replies with your stats!");

export async function execute(interaction: CommandInteraction) {
  const user = await userModel.findById(Number(interaction.user.id));
  const dailyRewardAvailable = !(
    new Date().getUTCDate() === user?.lastRewarded.getUTCDate() &&
    new Date().getUTCMonth() === user?.lastRewarded.getUTCMonth()
  );
  if (user) {
    interaction.reply(
      `${interaction.user.displayName} has ${
        user.currentPoints
      } coins, and their daily reward is ${
        dailyRewardAvailable ? "" : "not"
      } available.`
    );
  } else {
    interaction.reply(
      `Silly goose! You aren't registered. Do /register to start using DraftDiff.`
    );
  }
}
