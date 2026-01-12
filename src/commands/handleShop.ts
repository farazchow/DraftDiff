import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageFlags, StringSelectMenuInteraction } from "discord.js";
import { shopItems } from "./utility/shopItems";
import userModel from "../database/users";
import { TransferPoints } from "../database/dbFunctions";
import { SendDM } from "../discord-functions/SendMessage";
import { config } from "../config";

export async function handleShop(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const item = shopItems[Number(interaction.values[0])];
    const user = await userModel.findById(Number(interaction.user.id));
    if (!user || !item) {
        interaction.editReply({
            content: "Something went wrong. IDK how this happened tbh.",
        });
        return;
    }
    if (item.cost > user?.currentPoints) {
        interaction.editReply({
            content: "You don't have enough points for that.",
        });
        return;
    }

    const confirm = new ButtonBuilder()
        .setCustomId(`confirm-${interaction.values[0]}`)
        .setLabel("Confirm Purchase")
        .setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder()
        .setCustomId(`cancel-purchase`)
        .setLabel("Cancel Purchase")
        .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirm, cancel);

    interaction.editReply({
        content: `Are you sure you want to purchase **${item.name}** for **${item.cost}** points?`,
        components: [row]
    })
}

export async function handleConfirmedPurchase(interaction: ButtonInteraction) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const valueParts = interaction.customId.split("-")
    if (valueParts[0] === "cancel") {
        interaction.reply({
            content: "Come back later when you are sure!"
        });
        return;
    }

    const item = shopItems[Number(valueParts[1])];
    const user = await userModel.findById(Number(interaction.user.id));

    if (!user || !item) {
        interaction.editReply({
            content: "Something went wrong. IDK how this happened tbh.",
        });
        return;
    }
    if (item.cost > user?.currentPoints) {
        interaction.editReply({
            content: "You don't have enough points for that.",
        });
        return;
    }
    
    TransferPoints(user._id, undefined, item.cost, `Bought ${item.name}.`);
    interaction.editReply({
        content: `Thanks for your purchase. The admin will be notified.`,
    });
    SendDM(
        config.ADMIN_ID, 
        {content: `${user.discordName} has bought **${item.name}** for ${item.cost} points.`}
    );
}