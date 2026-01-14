import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import userModel from "../database/users";
import { stockMarket } from "../data-fetcher/StockMarket";

export const data = new SlashCommandBuilder()
    .setName("stocks")
    .setDescription("Check out the stock market");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const userID = Number(interaction.user.id);
    const user = await userModel.findById(userID);
    if (!user) {
        interaction.editReply({
        content: "You aren't registered with DraftDiff. Do /register to start!", 
        });
        return;
    }

    const buyButton = new ButtonBuilder()
        .setCustomId('sb')
        .setLabel('Buy Stocks')
        .setStyle(ButtonStyle.Primary);

    const sellButton = new ButtonBuilder()
        .setCustomId('ss')
        .setLabel('Sell Stocks')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buyButton, sellButton);

    const embed = stockMarket.GenerateStockMessage(user);
    await interaction.editReply({
        content: "",
        embeds: [embed],
        components: [row]
    });
}