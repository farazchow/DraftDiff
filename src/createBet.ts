import userModel from "./database/users";
import gameMatchModel from "./database/game_matches";
import axios from "axios";
import { config } from "./config";

export async function CreateBet(userID: number) {
    const registeredUser = await userModel.findById(userID);
    if (!registeredUser) {
        console.log("User is not registered.");
        return;
    }
    const riotIDS: string[] = registeredUser.riotIds;
    if (!riotIDS)
    {
        console.log("No Riot IDS associated with this user");
        return;
    }

    // Find the first account that is in a game.
    for (const id of riotIDS) {
        try {
            const currentGameInfo = await getLiveGame(id);
            if (!currentGameInfo) { continue; }
            const participants: number[] = [];
            for (const participant of currentGameInfo.participants)
            {
                const p = await userModel.findOne({riotIds: participant.puuid})
                if (p) { 
                    participants.push(p._id);
                }
            }
            console.log(participants);

            // Create DB object for match
            gameMatchModel.create({
                _id: currentGameInfo.gameId,
                usersPlaying: participants
            })

        } catch (error) {
            console.error("Problem while creating bet: ", error);
        }
    }
}

async function getLiveGame(puuid: string) {
    try {
        const response = await axios.get(
            `https://americas.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}`,
            {
                headers: {'X-Riot-Token': config.RIOT_API_KEY}
            }
        );
        return response.data;
    } catch {
        console.error("Didn't find a live game");
    }
}