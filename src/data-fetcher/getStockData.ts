import FinnhubAPI from "@stoqey/finnhub";
import { config } from "../config";

export async function getStockData(symbol: string) {
    const finnhubAPI = new FinnhubAPI(config.FINNHUB_KEY);
    const qoute = await finnhubAPI.getQuote(symbol);
    return qoute;
}