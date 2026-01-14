import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../../config";
import userModel from "../../database/users";

export const data = new SlashCommandBuilder()
    .setName('migration')
    .setDescription("Only for admins");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    if (interaction.user.id !== config.ADMIN_ID) {
        interaction.editReply("Not the admin!");
        return;
    }

    try {
        for await (const doc of userModel.find()) {
            if (!doc.stocks) {
                doc.stocks = new Map<string, number>();
            }

            doc.stocks.set('TEN', 0);
            doc.stocks.set('PHF', 0);
            doc.stocks.delete("Tencent");
            doc.stocks.delete("Hedge");
            await doc.save();
        }
        interaction.editReply("Finished updating...");
    } catch (error) {
        console.error(error);
        interaction.editReply("Failed");
    }

}