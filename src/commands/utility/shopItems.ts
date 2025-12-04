export interface ShopItem {
    name: string,
    cost: number,
    description: string
}
export function GetShopItemString(item: ShopItem) {
    return `**__${item.name}__ (${item.cost} points)**: ${item.description}`;
}

// Shop Items
const ChooseChamp: ShopItem = {
    name: "Keyboard & Mouse",
    cost: 1000,
    description: "Choose the creator's next champ."
};
const RandomGame: ShopItem = {
    name: "Used Steam Gift Card",
    cost: 2500,
    description: "Force the creator to play a specific video game."
}
const DifferentGameMode: ShopItem = {
    name: "Fidget Toy",
    cost: 500,
    description: "Force the creator to play a specific LOL gamemode."
}

export const shopItems: ShopItem[] = [DifferentGameMode, ChooseChamp, RandomGame];