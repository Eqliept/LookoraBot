import type { Language } from "../states/user.state.ts";
import { userState } from "../states/user.state.ts";

export const findUser = (userId: number) => {
    return userState.find(u => u.id === userId);
};

export const userExists = (userId: number): boolean => {
    return userState.some(u => u.id === userId);
};

export const createUser = (userId: number, language: Language) => {
    userState.push({ id: userId, language, coins: 100 });
};

export const updateUserLanguage = (userId: number, language: Language): boolean => {
    const user = findUser(userId);
    if (user) {
        user.language = language;
        return true;
    }
    return false;
};
