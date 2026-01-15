import { chromium } from "playwright";

export async function scrapeOPGG() {
    const browser = await chromium.launch({ headless: true});
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto("https://op.gg/lol/statistics/champions");
    await page.waitForSelector('tbody tr td div a strong', {timeout: 60000});

    const champStats: ChampStats[] = await page.locator('tbody tr:has(td div a strong)').evaluateAll(rows => 
        {
            return rows.map(row => ({
                name: row.querySelector('td div a strong')?.textContent?.trim() || 'NOTFOUND',
                winrate: Number(row.querySelector('td div span')?.textContent.split("%")[0]) || 0,
        }));
    });
    await browser.close();
    return champStats;
}

export type ChampStats = {
    name: string,
    winrate: number
}