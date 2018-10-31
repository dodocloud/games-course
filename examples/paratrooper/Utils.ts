
export function checkTime(lastTime, time, frequency) {
    return (time - lastTime) > 1000 / frequency;
}