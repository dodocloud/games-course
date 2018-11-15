
/**
 * Returns true if given time has already reached or exceeded certain period 
 */
export function checkTime(lastTime, time, frequency) {
    return (time - lastTime) > 1000 / frequency;
}