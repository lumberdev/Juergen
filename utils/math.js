export function randInt(min, max) {
    return ~~(Math.random() * (max - min + 1) + min);
}
