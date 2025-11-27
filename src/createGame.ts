import userModel from "./database/users";
import gameMatchModel from "./database/game_matches";
import { LiveGames, LiveGame } from "./LiveGames";
import { getLiveGame } from "./RiotFunctions";

const PAYFORPLAYAMOUNT = 25;

export async function CreateGame(userID: number) {
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
        const newLiveGame = new LiveGame(currentGameInfo.gameId);
        for (const participant of currentGameInfo.participants) {
          const p = await userModel.findOne({ riotIds: participant.puuid });
          if (p) {
            const pointsPayed = Math.min(PAYFORPLAYAMOUNT, p.currentPoints);
            newLiveGame.AddBet(p._id, true, pointsPayed);
            newLiveGame.discordUsers.push(p._id);
            newLiveGame.riotIds.push(participant.puuid);
          }
        }

        LiveGames.push(newLiveGame);

        // Create DB object for match
        gameMatchModel.create({
          _id: currentGameInfo.gameId,
          usersPlaying: newLiveGame.discordUsers,
        });
        break;
      }
    } catch (error) {
      console.error("Problem while creating bet: ", error);
    }
  }
}
