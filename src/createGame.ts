import userModel from "./database/users";
import gameMatchModel from "./database/game_matches";
import { LiveGames, LiveGame } from "./LiveGames";
import { getLiveGame } from "./RiotFunctions";
import { ChampData } from "./database/champData";

const gamesProcessing: Set<number> = new Set();
const champData = new ChampData();

export type Competitor = {
  puuid: string;
  discordId?: number;
  discordName?: string;
  champName: string;
  blueSide: boolean;
  result?: string;
}

export async function CreateGame(userID: number, bettingTimeInMinutes:number = 5) {
  const registeredUser = await userModel.findById(userID);
  if (!registeredUser) {
    console.log("User is not registered.");
    return;
  }
  const riotIDS: string[] = registeredUser.riotIds;
  if (!riotIDS) {
    console.log("No Riot IDS associated with this user");
    return;
  }

  // Find the first account that is in a game.
  for (const id of riotIDS) {
    try {
      const currentGameInfo = await getLiveGame(id);
      if (currentGameInfo) {
        // we are already processing this game
        if (gamesProcessing.has(currentGameInfo.gameId)) {
          console.log(`Already Processing : NA1_${currentGameInfo.gameId}`);
          return;
        }

        gamesProcessing.add(currentGameInfo.gameId);
        const newLiveGame = new LiveGame(currentGameInfo.gameId, bettingTimeInMinutes);
        for (const participant of currentGameInfo.participants) {
          const p = await userModel.findOne({ riotIds: participant.puuid });
          if (p) {
            newLiveGame.riotIds.push(participant.puuid);
            newLiveGame.discordUsers.push(p._id);
          }
          const competitor: Competitor = {
            puuid: participant.puuid ?? "null",
            discordId: (p) ? p._id : undefined,
            discordName: (p) ? p.discordName : undefined,
            champName: champData.get(participant.championID),
            blueSide: (participant.teamId === 100)
          };
          newLiveGame.competitors.push(competitor);
        }

        // Add to our current list of live games.
        LiveGames.push(newLiveGame);

        // Create DB object for match
        await gameMatchModel.create({
          _id: currentGameInfo.gameId,
          usersPlaying: newLiveGame.discordUsers,
        });
        gamesProcessing.delete(currentGameInfo.gameId);
        newLiveGame.SendBetMessage();
        console.log(`Finished Processing: NA1_${currentGameInfo.gameId}`);
        return;
      }
    } catch (error) {
      console.error("Problem while creating bet: ", error);
    }
  }
}
