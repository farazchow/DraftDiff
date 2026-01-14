import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ChampData } from "../../database/champData";

export const data = new SlashCommandBuilder()
    .setName("getchamp")
    .setDescription("Get Champ by ID")
    .addIntegerOption((option) => 
        option.setName("champ-id")
        .setDescription("the champ's id")
        .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    if (!(interaction instanceof ChatInputCommandInteraction)) {
        interaction.editReply("something went wrong");
        return;
    }

    const champData = new ChampData();
    const champ = champData.get(interaction.options.getInteger("champ-id") ?? 0);
    await interaction.editReply(champ);
}