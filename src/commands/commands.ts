// import * as ping from "./utility/ping";
import * as stats from "./stats";
import * as register from "./register";
import * as addRiotID from "./addRiotID";
import * as code from "./code";
import * as coinflip from "./coinflip";
import * as pointShop from "./pointShop";
import * as leaderboard from "./leaderboard";
import * as pay from "./pay";

export const commands = new Map([
  // [ping.data.name, ping],
  [stats.data.name, stats],
  [register.data.name, register],
  [addRiotID.data.name, addRiotID],
  [code.data.name, code],
  [coinflip.data.name, coinflip],
  [pointShop.data.name, pointShop],
  [leaderboard.data.name, leaderboard],
  [pay.data.name, pay],
]);