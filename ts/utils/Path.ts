import Vec2 from '../../ts/utils/Vec2';

export class PathContext {
    currentPointIndex: number = -1;
    targetPointIndex: number;
    targetLocation: Vec2;
}

export class PathSegment {
    // starting position
    start: Vec2;
    // final position
    end: Vec2;
    // segment length
    length: number;

    constructor(start: Vec2, end: Vec2) {
        this.start = start;
        this.end = end;
        this.length = (end.subtract(start)).magnitude();
    }
}

/**
 * Sequence of line segments used in steering behaviors
 */
export class Path {
    // collection of segments
    segments: Array<PathSegment>;
    // total length of the path
    pathLength: number;

    constructor(firstSegmentStart: Vec2, firstSegmentEnd: Vec2) {
        this.addFirstSegment(firstSegmentStart, firstSegmentEnd);
    }

    private addFirstSegment(firstSegmentStart: Vec2, firstSegmentEnd: Vec2) {
        // clear all segments
        this.segments = new Array<PathSegment>();

        let firstSegment = new PathSegment(firstSegmentStart, firstSegmentEnd);
        this.segments.push(firstSegment);
        this.pathLength = firstSegment.length;
    }

    addSegment(endPoint: Vec2) {
        // connect the segment to the last one
        let lastSegment = this.segments[this.segments.length - 1];
        let newSegment = new PathSegment(lastSegment.end, endPoint);
        this.segments.push(newSegment);
        this.pathLength += newSegment.length;
    }

    calcTargetPoint(radiusTolerance: number, location: Vec2, context: PathContext) {
        let currentSegment = this.segments[context.currentPointIndex != -1 ? context.currentPointIndex : 0];

        if (context.currentPointIndex == -1 && location.distance(currentSegment.start) > radiusTolerance) {
            context.targetPointIndex = -1; // not yet at the beginning
            context.targetLocation = currentSegment.start;
            return;
        }

        if (location.distance(currentSegment.end) > radiusTolerance) {
            // still not there. Go to the end of the segment
            context.targetPointIndex = context.currentPointIndex;
            context.targetLocation = currentSegment.end;
            return;
        } else {
            if (context.currentPointIndex == this.segments.length - 1) {
                // finish
                context.targetPointIndex = context.currentPointIndex;
                context.targetLocation = location; // stay where you are
            } else {
                // go to the end of the next segment
                context.targetPointIndex = context.currentPointIndex + 1;
                context.targetLocation = this.segments[context.targetPointIndex].end;
            }

            return;
        }
    }
}