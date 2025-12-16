import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import userModel from "../database/users";

export const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Registers your account with DraftDiff");

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();
  const userID = Number(interaction.user.id);
  const discordName = interaction.user.username;
  const yesterday = new Date().setDate(new Date().getDate() - 1);
  try {
    const user = await userModel.findById(userID);
    if (user) {
      interaction.editReply({
        content: "Stupid fucking idiot, you are already registered.",
      });
      return;
    }

    await userModel.create({
      _id: userID,
      discordName: discordName,
      currentPoints: 100,
      lastRewarded: yesterday,
    });

    const text = `${interaction.user.displayName} has ${100} coins.`;
    await interaction.editReply(text);
  } catch (err) {
    if (err instanceof Error) {
      interaction.editReply(err.toString());
    } else {
      interaction.editReply(
        "Something went wrong while trying to register. Sorry!"
      );
    }
  }
}
