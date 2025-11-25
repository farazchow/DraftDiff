import { SlashCommandBuilder, CommandInteraction, ChatInputCommandInteraction } from "discord.js";
import userModel from "../database/users";
import axios from 'axios';
import { config } from "../config";

export const data = new SlashCommandBuilder()
    .setName('add-riot-id')
    .setDescription('Add Riot ID to your DraftDiff account')
    .addStringOption((option) => 
        option.setName("riot-id")
        .setDescription("The RiotID you want to add")
        .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
        if (!(interaction instanceof ChatInputCommandInteraction)) {
            interaction.reply("Something went wrong while trying to add a Riot ID. Sorry!");
            return;
        }
        const userID = Number(interaction.user.id);
        const riotID = interaction.options.getString("riot-id");
        try {
            const riotAccountData = await getRiotAccount(riotID!);
            await userModel.findByIdAndUpdate(
                userID,
                { $addToSet: {riotIds: riotAccountData.puuid}}
             );
            const text = `${interaction.user.displayName} added RIOT ID ${riotID}`;
            await interaction.reply(text);
        } catch (err) {
            if (err instanceof Error) {
                interaction.reply(err.toString());
            } else {
                interaction.reply("Something went wrong while trying to add a Riot ID. Sorry!");
            }
        }
    }

async function getRiotAccount(riotID: string) {
    try {
        const gameName = riotID.split("#")[0];
        const tagLine = riotID.split("#")[1];
        const response = await axios.get(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            {
                headers: {'X-Riot-Token': config.RIOT_API_KEY}
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching Riot Account: ", error);
    }
}