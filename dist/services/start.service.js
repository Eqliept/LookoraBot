import { userState } from "../states/user.state.js";
export const startService = (userId, language) => {
    userState.push({ id: userId, language, coins: 100 });
};
//# sourceMappingURL=start.service.js.map