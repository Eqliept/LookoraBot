import type { Language } from "../states/user.state.js"
import { userState } from "../states/user.state.js"

export const startService = (userId: number, language: Language) => {
    userState.push({ id: userId, language, coins: 100 });
}