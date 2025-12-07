import {
  SlashCommandBuilder,
  CommandInteraction,
  ChatInputCommandInteraction,
  userMention,
  MessageFlags,
} from "discord.js";
import userModel from "../database/users";
import { TransferPoints } from "../database/dbFunctions";

const COOLDOWN_TIME = 30 * 60 * 1000;
let cooldown = false;
let timestamp = new Date();
let lossCounter = 0;

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
  if (!(interaction instanceof ChatInputCommandInteraction)) {
    interaction.reply(
      "Something went wrong while trying to coinflip. Sorry!"
    );
    return;
  }
  const userID = Number(interaction.user.id);
  const user = await userModel.findById(userID);
  const amount = Math.floor(Number(interaction.options.getString("bet-amount")));

  if (!user) {
    interaction.reply({
      content: "You aren't registered with DraftDiff. Do /register to start!", 
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (cooldown) {
    interaction.reply({
      content: `Sorry, coinflip is on cooldown. Try again at ${timestamp.toTimeString()}`, 
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (isNaN(amount)) {
    interaction.reply({
      content: "You didn't input a proper number. Try again later.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (amount <= 0) {
    interaction.reply({
      content: "Positive numbers only. Try again later.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (amount > user.currentPoints) {
    interaction.reply({
      content: "Tried betting more points than you had! Try again later.",
      flags: MessageFlags.Ephemeral
  });
    return;
  }
  // Okay should be good to go now
  const mult = () => ((lossCounter ** 3)/75 + 1);
  cooldown = true;
  setTimeout(() => cooldown = false, COOLDOWN_TIME);
  timestamp =  new Date(Date.now() + COOLDOWN_TIME);
  const amountEarned = Math.ceil(amount * mult());
  
  if (Math.random() > .5) {
    TransferPoints(undefined, userID, amountEarned, `Won the coinflip with a ${mult().toFixed(2)}x multiplier!`);
    lossCounter = 0;
    interaction.reply(
      `Congrats ${userMention(interaction.user.id)}! You won ${amountEarned} point(s)! Coinflip is next available at <t:${timestamp.getTime()}:t> with a muliplier of **1x**.`
    );
  } else {
    TransferPoints(userID, undefined, amount, "Lost the coinflip!");
    lossCounter += 1;
    interaction.reply(
      `Congrats ${userMention(interaction.user.id)}! You lost ${amount} point(s)! Coinflip is next available at <t:${timestamp.getTime()}:t> with a muliplier of **${mult().toFixed(2)}**.`
    );
  }
}