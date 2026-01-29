export const padText = (text, width = 20) => {
    const padding = Math.max(0, width - text.length);
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return " ".repeat(left) + text + " ".repeat(right);
};
//# sourceMappingURL=utils.js.map