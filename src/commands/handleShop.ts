import { MessageFlags, StringSelectMenuInteraction } from "discord.js";
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

    TransferPoints(user._id, undefined, item.cost, `Bought ${item.name}.`);
    interaction.editReply({
        content: `Thanks for your purchase. The admin will be notified.`,
    });
    SendDM(
        config.ADMIN_ID, 
        {content: `${user.discordName} has bought **${item.name}** for ${item.cost} points.`}
    );
}