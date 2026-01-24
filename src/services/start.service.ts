import type { Language } from "../states/user.state.ts"
import { userState } from "../states/user.state.ts"

export const startService = (userId: number, language: Language) => {
    userState.push({ id: userId, language, coins: 100 });
}