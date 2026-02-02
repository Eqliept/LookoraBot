import type { Language } from "../types/index.js";
export interface BattleUITranslations {
    battleTitle: string;
    player1: string;
    player2: string;
    sendPlayer1Front: string;
    sendPlayer1Side: string;
    sendPlayer2Front: string;
    sendPlayer2Side: string;
    analyzing: string;
    comparison: string;
    winner: string;
    draw: string;
    verdict: string;
    impressionCoeff: string;
    charged: string;
    remaining: string;
    newBattle: string;
    backButton: string;
    photoLoadError: string;
    photoInvalid: string;
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    jawline: string;
    cheekbones: string;
    symmetry: string;
    eyebrows: string;
}
export declare const getBattleUI: (lang: Language) => BattleUITranslations;
//# sourceMappingURL=battle.translations.d.ts.map