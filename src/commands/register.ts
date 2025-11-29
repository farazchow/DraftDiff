import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import userModel from "../database/users";

export const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Registers your account with DraftDiff");

export async function execute(interaction: CommandInteraction) {
  const userID = Number(interaction.user.id);
  const discordName = interaction.user.username;
  const yesterday = new Date().setDate(new Date().getDate() - 1);
  try {
    await userModel.create({
      _id: userID,
      discordName: discordName,
      currentPoints: 100,
      lastRewarded: yesterday,
    });

    const text = `${interaction.user.displayName} has ${100} coins.`;
    await interaction.reply(text);
  } catch (err) {
    if (err instanceof Error) {
      interaction.reply(err.toString());
    } else {
      interaction.reply(
        "Something went wrong while trying to register. Sorry!"
      );
    }
  }
}
