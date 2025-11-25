import * as ping from "./utility/ping";
import * as stats from "./stats";
import * as register from "./register";
import * as addRiotID from "./addRiotID";

export const commands = new Map([
    [ping.data.name, ping],
    [stats.data.name, stats],
    [register.data.name, register],
    [addRiotID.data.name, addRiotID],
]);