import { ActionRowBuilder, CommandInteraction, ContainerBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder } from "discord.js";
import userModel from "../database/users";
import { shopItems, GetShopItemString } from "./utility/shopItems";

export const data = new SlashCommandBuilder()
    .setName('point-shop')
    .setDescription("View the point redemption shop");

export async function execute(interaction: CommandInteraction) {
    const userID = Number(interaction.user.id);
    const user = await userModel.findById(userID);

    if (!user) {
        interaction.reply({
            content: "You aren't registered. Do /register to start!",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const firstText = new TextDisplayBuilder().setContent(
        `Welcome to the shop! You have **${user.currentPoints}** points!`
    );
    const seperator = new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small);
    const shopText = new TextDisplayBuilder().setContent(
        `${shopItems.map((item) => GetShopItemString(item)).join("\n")}`
    );
    const itemSelection = new StringSelectMenuBuilder()
        .setCustomId('shop-item')
        .setPlaceholder('What are you buying?')
        .setMaxValues(1);
    let i = 0;
    for (const item of shopItems) {
        itemSelection.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(item.name)
                // .setDescription(item.description)
                .setValue(i.toString())
        );
        i++;
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(itemSelection);
    const shopContainer = new ContainerBuilder()
        .setAccentColor(0x0099ff)
        .addTextDisplayComponents(firstText)
        .addSeparatorComponents(seperator)
        .addTextDisplayComponents(shopText)
        .addActionRowComponents(row);

    await interaction.reply({
        components: [shopContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
}

