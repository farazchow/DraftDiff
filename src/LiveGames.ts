import { getLiveGame, getFinishedGame } from "./RiotFunctions";
import predictionsModel from "./database/predictions";
import gameMatchModel from "./database/game_matches";
import { TransferPoints } from "./database/dbFunctions";

const POLLING_RATE = 15 * 1000;

export const LiveGames: LiveGame[] = [];

export class LiveGame {
  gameId: number;
  bets: Bets[];
  betting: boolean;
  timeOutID: NodeJS.Timeout;
  riotIds: number[];
  discordUsers: number[];
  intervalID: NodeJS.Timeout | undefined;

  constructor(gameId: number, bettingTimeInMinutes: number = 5) {
    this.gameId = gameId;
    this.bets = [];
    this.betting = true;
    this.riotIds = [];
    this.discordUsers = [];
    this.timeOutID = setTimeout(() => {
      this.betting = false;
      this.intervalID = setInterval(() => {
        this.ResolveGame();
      }, POLLING_RATE);
    }, bettingTimeInMinutes * 60 * 1000);
  }

  AddBet(userID: number, predicted_win: boolean, pointsBet: number) {
    if (this.betting) {
      this.bets.push(new Bets(userID, predicted_win, pointsBet));
      TransferPoints(userID, undefined, pointsBet, `Bet on NA_${this.gameId}`);
    } else {
      console.error(`Betting window for game ${this.gameId} is closed.`);
    }
  }

  // Returns False if game is ongoing, True if resolved appropriately
  async ResolveGame(): Promise<boolean> {
    if (this.intervalID && this.riotIds.length !== 0) {
      // If game is ongoing
      const liveData = await getLiveGame(this.riotIds[0].toString());
      if (liveData) {
        return false;
      }

      // Game has finished
      const finishedGame = await getFinishedGame(
        "NA_" + this.gameId.toString()
      );
      if (finishedGame) {
        // Find result
        let result = "Loss";
        if (finishedGame.info.gameDuration < 5 * 60 * 1000) {
          // Remake
          result = "Remake";
        } else {
          const participantDTOs = finishedGame.info.participants.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (p: any) => this.riotIds.includes(p.uuid)
          );
          if (participantDTOs && participantDTOs[0].win) {
            result = "Win";
          }
        }

        // Resolve Bets
        const [winAmount, lossAmount] = this.GetBetTotals();

        for (const bet of this.bets) {
          const predicted = bet.predictedWin ? "Win" : "Loss";
          let amountEarned = 0;
          const correctSideTotal = result === "Win" ? winAmount : lossAmount;
          const wrongSideTotal = result === "Win" ? lossAmount : winAmount;
          if (result == "Remake") {
            amountEarned = bet.pointsBet;
          } else if (result === predicted) {
            amountEarned =
              bet.pointsBet +
              Math.ceil((bet.pointsBet / correctSideTotal) * wrongSideTotal);
          }

          // Create Prediction
          predictionsModel.create({
            userId: bet.userID,
            matchId: "NA_" + this.gameId.toString(),
            amountBet: bet.pointsBet,
            prediction: predicted,
            outcome: result,
            amountEarned: amountEarned,
          });

          // Create Transactions and Update User's Current Points
          if (amountEarned !== 0) {
            TransferPoints(
              undefined,
              bet.userID,
              amountEarned,
              `Bet ${bet.pointsBet} and won ${amountEarned}`
            );
          }
        }

        // Update GameModel
        const thisGame = await gameMatchModel.findById(this.gameId);
        if (thisGame) {
          thisGame.outcome = result as "Win" | "Loss" | "Remake";
          thisGame.save();
        }
        // Remove the Game from the Lives Game List
        LiveGames.filter((game) => game.gameId !== this.gameId);
        // Stop the check for this game
        clearInterval(this.intervalID);
      } else {
        throw new Error("Game was both not live, nor finished");
      }
    }
    return true;
  }

  // Returns amount of points bet for [WIN, LOSS]
  GetBetTotals(): [number, number] {
    let lossAmount = 0;
    let winAmount = 0;
    for (const bet of this.bets) {
      if (bet.predictedWin) {
        winAmount += bet.pointsBet;
      } else {
        lossAmount += bet.pointsBet;
      }
    }
    return [winAmount, lossAmount];
  }
}

export class Bets {
  userID: number;
  predictedWin: boolean;
  pointsBet: number;

  constructor(userID: number, predicted_win: boolean, points_bet: number) {
    this.userID = userID;
    this.predictedWin = predicted_win;
    this.pointsBet = points_bet;
  }
}
