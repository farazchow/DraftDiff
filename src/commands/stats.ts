import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import userModel from "../database/users";
import { stockMarket } from "../data-fetcher/StockMarket";

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Replies with your stats!");

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();
  const user = await userModel.findById(Number(interaction.user.id));
  const dailyRewardAvailable = !(
    new Date().getUTCDate() === user?.lastRewarded.getUTCDate() &&
    new Date().getUTCMonth() === user?.lastRewarded.getUTCMonth()
  );
  if (user) {
    let investedAmount = 0;
    for (const stock of [stockMarket.ESTC, stockMarket.MIT, stockMarket.TEN, stockMarket.PHF]) {
      investedAmount += (user.stocks.get(stock.ticker) ?? 0) * stock.value;
    }
    interaction.editReply(
      `${interaction.user.displayName} has **${user.currentPoints} coins** and **${investedAmount} coins invested**. Their daily reward is **${dailyRewardAvailable ? "" : "not "}available**.`
    );
  } else {
    interaction.editReply(
      `Silly goose! You aren't registered. Do /register to start using DraftDiff.`
    );
  }
}
