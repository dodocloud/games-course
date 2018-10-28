
// Convert radians to degrees
function radToDeg(angle: number): number {
    return angle * (180 / Math.PI);
}

// Convert degrees to radians
function degToRad(angle: number): number {
    return angle * (Math.PI / 180);
}

// Check if two circles intersect
function circleIntersection(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
    // Calculate the distance between the centers
    var dx = x1 - x2;
    var dy = y1 - y2;

    if (Math.abs(dx) < (r1 + r2) && Math.abs(dy) < r1 + r2) {
        return true;
    }

    return false;
}

function isTime(frequency: number, lastTime: number, currentTime: number): boolean {
    let delta = currentTime - lastTime;
    return delta > 1 / frequency;
}


// Get a random int between low and high, inclusive
function randRange(low: number, high: number): number {
    return Math.floor(low + Math.random() * (high - low + 1));
}