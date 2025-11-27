import axios from "axios";
import { config } from "./config";

export async function getLiveGame(puuid: string) {
  try {
    const response = await axios.get(
      `https://na1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      {
        headers: { "X-Riot-Token": config.RIOT_API_KEY },
      }
    );
    return response.data;
  } catch {
    console.error("Didn't find a live game");
    return null;
  }
}

export async function getFinishedGame(matchId: string) {
  try {
    const response = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { "X-Riot-Token": config.RIOT_API_KEY },
      }
    );
    return response.data;
  } catch {
    console.error("Didn't find a live game");
    return null;
  }
}
