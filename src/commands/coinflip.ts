import {
  SlashCommandBuilder,
  CommandInteraction,
  ChatInputCommandInteraction,
  userMention,
} from "discord.js";
import userModel from "../database/users";
import { TransferPoints } from "../database/dbFunctions";

const COOLDOWN_TIME = 15 * 60 * 1000;
let cooldown = false;
let timestamp = new Date();
// let lossCounter = 0;
let accumulatedPoint = 102229;
const ACCUMULATION_RATIO = .5;

export const data = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("50/50 chance of doubling up or losing everything")
  .addStringOption((option) =>
    option
      .setName("bet-amount")
      .setDescription("The number of points you want to gamble")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();
  if (!(interaction instanceof ChatInputCommandInteraction)) {
    interaction.editReply(
      "Something went wrong while trying to coinflip. Sorry!"
    );
    return;
  }
  const userID = Number(interaction.user.id);
  const user = await userModel.findById(userID);
  const amount = Math.floor(Number(interaction.options.getString("bet-amount")));

  if (!user) {
    interaction.editReply({
      content: "You aren't registered with DraftDiff. Do /register to start!", 
    });
    return;
  }
  if (cooldown) {
    interaction.editReply({
      content: `Sorry, coinflip is on cooldown. Try again at ${timestamp.toTimeString()}`, 
    });
    return;
  }
  if (isNaN(amount)) {
    interaction.editReply({
      content: "You didn't input a proper number. Try again later.",
    });
    return;
  }
  if (amount <= 0) {
    interaction.editReply({
      content: "Positive numbers only. Try again later.",
    });
    return;
  }
  if (amount > user.currentPoints) {
    interaction.editReply({
      content: "Tried betting more points than you had! Try again later.",
  });
    return;
  }
  
  // Okay should be good to go now
  // const mult = () => ((lossCounter ** 3)/75 + 1);
  cooldown = true;
  setTimeout(() => cooldown = false, COOLDOWN_TIME);
  timestamp =  new Date(Date.now() + COOLDOWN_TIME);
  // const amountEarned = Math.ceil(amount * mult());
  const bonusEarned = Math.min(accumulatedPoint, amount);
  const amountEarned = amount + bonusEarned;

  
  if (Math.random() > .5) {
    TransferPoints(undefined, userID, amountEarned, `Won the coinflip with a bonus ${bonusEarned} points`);
    accumulatedPoint -= bonusEarned;
    // lossCounter = 0;
    await interaction.editReply(
      `Congrats ${userMention(interaction.user.id)}! You won ${amountEarned} point(s)! Coinflip is next available at <t:${Math.floor(timestamp.getTime()/1000)}:f> with a bonus of **${accumulatedPoint} points**.`
    );
  } else {
    TransferPoints(userID, undefined, amount, "Lost the coinflip!");
    // lossCounter += 1;
    accumulatedPoint += Math.ceil(amount * ACCUMULATION_RATIO);
    await interaction.editReply(
      `Congrats ${userMention(interaction.user.id)}! You lost ${amount} point(s)! Coinflip is next available at <t:${Math.floor(timestamp.getTime()/1000)}:f> with a bonus of **${accumulatedPoint} points**.`
    );
  }
}
