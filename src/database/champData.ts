import * as championJson from '../../assets/champion.json';

export class ChampData {
    champNames: Map<number, string> = new Map<number, string>();

    constructor() {
        const data = championJson.data;
        for (const champ in data) {
            this.champNames.set(Number(data[champ as keyof typeof data].key),  data[champ as keyof typeof data].name);
        }
    }

    get(id:number) {
        const name = this.champNames.get(id);
        return (name === undefined) ? "CHAMPNOTFOUND" : name;
    }
}