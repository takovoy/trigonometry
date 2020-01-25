export type PointType = [number, number];
export type SplinePointType = [number, number, boolean];
export type PathPointType = [number, number, number | boolean, number, number];

export const TRIGONOMETRY = {
    getPointOnCircle: function(
        radian: number,
        radius: number,
        centerX: number,
        centerY: number
    ): PointType {
        centerX = +centerX || 0;
        centerY = +centerY || 0;
        return  [
            centerX + radius * Math.cos(radian),
            centerY + radius * Math.sin(radian)
        ];
    },

    getPointOnEllipse: function(
        radiusX: number,
        radiusY: number,
        shift: number,
        tilt: number,
        centerX: number,
        centerY: number
    ): PointType {
        tilt = tilt || 0;
        tilt *= -1;
        centerX = centerX || 0;
        centerY = centerY || 0;

        const x1  = radiusX * Math.cos(+shift),
              y1  = radiusY * Math.sin(+shift),
              x2  = x1 * Math.cos(tilt) + y1 * Math.sin(tilt),
              y2  = -x1 * Math.sin(tilt) + y1 * Math.cos(tilt);

        return [x2 + centerX, y2 + centerY];
    },

    getPointsFromPolygon: function(
        sidesCount: number,
        radian: number,
        radius: number,
        centerX: number,
        centerY: number
    ): PointType[] {
        const coord: PointType[] = [];
        coord.push(this.getPointOnCircle(radian, radius, centerX, centerY));
        for (let i = 0; i < sidesCount; i++) {
            coord.push(this.getPointOnCircle(Math.PI * 2 / sidesCount * i + radian, radius, centerX, centerY));
        }
        return coord;
    },

    getPointOnCurve: function(
        shift: number,
        points: PointType[]
    ): PointType {
        const result: PointType = [0, 0];
        const powerOfCurve = points.length - 1;
        shift = shift / 100;
        for (let i = 0; points[i]; i++) {
            const polynom = (
                    TRIGONOMETRY.factorial(powerOfCurve) /
                    (
                        TRIGONOMETRY.factorial(i) *
                        TRIGONOMETRY.factorial(powerOfCurve - i)
                    )
                ) * Math.pow(shift, i) * Math.pow(1 - shift, powerOfCurve - i);
            result[0] += points[i][0] * polynom;
            result[1] += points[i][1] * polynom;
        }
        return result;
    },

    getPointOnLine: function(
        shift: number,
        points: PointType[]
    ): PointType {
        return [
            (points[1][0] - points[0][0]) * (shift / 100) + points[0][0],
            (points[1][1] - points[0][1]) * (shift / 100) + points[0][1]
        ];
    },

    getCenterToPointDistance: function(
        coordinates: PointType
    ): number {
        return Math.sqrt(Math.pow(coordinates[0], 2) + Math.pow(coordinates[1], 2));
    },

    HEXtoRGBA: function(
        color: string,
        opacity?: number
    ): [number, number, number, number] {
        const rgba: [number, number, number, number] = [0, 0, 0, 1];
        if (color.length === 4) {
            rgba[0] = parseInt(color.substring(1, 2) + color.substring(1, 2), 16);
            rgba[1] = parseInt(color.substring(2, 3) + color.substring(2, 3), 16);
            rgba[2] = parseInt(color.substring(3) + color.substring(3), 16);
        }
        if (color.length === 7) {
            rgba[0] = parseInt(color.substring(1, 3), 16);
            rgba[1] = parseInt(color.substring(3, 5), 16);
            rgba[2] = parseInt(color.substring(5), 16);
        }
        if (opacity || opacity === 0) {
            rgba[3] = opacity;
        }
        return rgba;
    },

    RGBtoRGBA: function(
        color: string
    ): [number, number, number, number] {
        const parsedStroke = color.match(/\d{1,3}(\.\d+)?/g);
        const rgba: [number, number, number, number] = [
            +parsedStroke[0],
            +parsedStroke[1],
            +parsedStroke[2],
            1
        ];
        if ( parsedStroke[3] === '0' ) {
            rgba[3] = 0;
        } else {
            rgba[3] = +parsedStroke[3] || 1;
        }
        return rgba;
    },

    changeColor : function(
        start,
        end,
        shift: number
    ): string {
        const result = [];

        if ( isRGBA(start) || isRGB(start) ) {
            start = TRIGONOMETRY.RGBtoRGBA(start);
        } else if ( isHEXColor(start) ) {
            start = TRIGONOMETRY.HEXtoRGBA(start)
        }

        if ( isRGBA(end) || isRGB(end) ) {
            end = TRIGONOMETRY.RGBtoRGBA(end);
        } else if ( isHEXColor(end) ) {
            end = TRIGONOMETRY.HEXtoRGBA(end)
        }

        for (let i = 0; i < 3; i++) {
            result[i] = Math.round(+start[i] + (+end[i] - +start[i]) / 100 * shift);
        }
        const opacity = +(+start[3] + (+end[3] - +start[3]) / 100 * shift).toFixed(4);
        return 'rgba(' + result[0] + ',' + result[1] + ',' + result[2] + ',' + opacity + ')';
    },

    factorial : function (number: number) {
        let result = 1;
        while (number) {
            result *= number--;
        }
        return result;
    },

    getAngleOfVector: function(
        point: PointType,
        center: PointType
    ): number {
        center = center || [0, 0];
        point = point || [0, 0];
        point = [point[0] - center[0], point[1] - center[1]];
        const distance = TRIGONOMETRY.getCenterToPointDistance(point);
        const angle = Math.asin(point[1] / distance);
        const acos  = Math.acos(point[0] / distance);
        if (acos > Math.PI / 2) {
            return Math.PI - angle;
        }
        return angle;
    },

    getLengthOfCurve: function (
        points: PointType[],
        step: number
    ) {
        step = step || 1;
        let result = 0;
        let lastPoint = points[0];
        for (let sift = 0; sift <= 100; sift += step) {
            const coord = TRIGONOMETRY.getPointOnCurve(sift, points);
            result += TRIGONOMETRY.getCenterToPointDistance([
                coord[0] - lastPoint[0],
                coord[1] - lastPoint[1]
            ]);
            lastPoint = coord;
        }
        return result;
    },

    getMapOfSpline: function (
        points: SplinePointType[],
        step: number
    ): number[] {
        const curves: PointType[][] = [[]];
        const map: number[] = [];
        let index = 0;
        for (let i = 0; points[i]; i++) {
            const curvePointsCount = curves[index].length;
            curves[index][+curvePointsCount] = [points[i][0], points[i][1]];

            if (points[i][2] && i !== points.length - 1) {
                map[index] = TRIGONOMETRY.getLengthOfCurve(curves[index], step);
                index++;
                curves[index] = [[points[i][0], points[i][1]]];
            }
        }
        map[index] = TRIGONOMETRY.getLengthOfCurve(curves[index], step);
        return map;
    },

    getPointOnSpline: function (
        shift: number,
        points: SplinePointType[],
        services
    ): PointType {
        let shiftLength = services.length / 100 * shift;
        if (shift >= 100) {
            shiftLength = services.length;
        }
        let counter = 0;
        let lastControlPoint = 0;
        let controlPointsCounter = 0;
        const checkedCurve = [];
        for (; services.map[lastControlPoint] && counter + services.map[lastControlPoint] < shiftLength; lastControlPoint++) {
            counter += services.map[lastControlPoint];
        }
        for (let pointIndex = 0; points[pointIndex] && controlPointsCounter <= lastControlPoint; pointIndex++) {
            if (points[pointIndex][2] === true) {
                controlPointsCounter++;
            }
            if (controlPointsCounter >= lastControlPoint) {
                checkedCurve.push(points[pointIndex]);
            }
        }
        return TRIGONOMETRY.getPointOnCurve(
            (shiftLength - counter) / (services.map[lastControlPoint] / 100),
            checkedCurve
        );
    },

    getLengthOfEllipticArc: function (
        radiusX: number,
        radiusY: number,
        startRadian: number,
        endRadian: number,
        step: number
    ): number {
        step = step || 1;
        let length = 0;
        let lastPoint = this.getPointOnEllipse(radiusX, radiusY, startRadian);
        const radianPercent = (endRadian - startRadian) / 100;
        for (let i = 0; i <= 100; i += step) {
            const radian = startRadian + radianPercent * i;
            const point = this.getPointOnEllipse(radiusX, radiusY, radian);
            length += this.getCenterToPointDistance([point[0] - lastPoint[0], point[1] - lastPoint[1]]);
            lastPoint = point;
        }
        return length;
    },

    getMapOfPath: function (
        points: PathPointType[],
        step
    ) {
        const curves: PointType[][] = [[]];
        const map: number[] = [];
        let index = 0;
        let lastPoint = [];
        for (let i = 0; points[i]; i++) {
            const point = points[i];
            if (point.length > 3) {
                map[index] = TRIGONOMETRY.getLengthOfEllipticArc(point[0], point[1], +point[2], point[3], step);
                if (!points[i + 1]) {
                    continue;
                }
                const centerOfArc = TRIGONOMETRY.getPointOnEllipse(
                    point[0],
                    point[1],
                    +point[2] + Math.PI,
                    point[4],
                    lastPoint[0],
                    lastPoint[1]
                );
                const endOfArc = TRIGONOMETRY.getPointOnEllipse(
                    point[0],
                    point[1],
                    point[3],
                    point[4],
                    centerOfArc[0],
                    centerOfArc[1]
                );
                index++;
                curves[index] = [endOfArc];
                lastPoint = endOfArc;
                continue;
            }
            curves[index].push([point[0], point[1]]);
            if (point[2] === true || (points[i + 1] && points[i + 1].length > 3)) {
                map[index] = TRIGONOMETRY.getLengthOfCurve(curves[index], step);
                index++;
                curves[index] = [[point[0], point[1]]];
            }
            lastPoint = point;
        }
        if (typeof map[index] !== 'number') {
            map[index] = TRIGONOMETRY.getLengthOfCurve(curves[index], step);
        }
        return map;
    },

    getPointOnPath: function (
        shift: number,
        points: PathPointType[],
        services
    ): PointType {
        let shiftLength = services.length / 100 * shift;
        if (shift >= 100) {
            shiftLength = services.length;
        }
        let counter = 0;
        let lastControlPoint = 0;
        let controlPointsCounter = 0;
        const checkedCurve = [];
        for (; services.map[lastControlPoint] && counter + services.map[lastControlPoint] < shiftLength; lastControlPoint++) {
            counter += services.map[lastControlPoint];
        }
        let lastPoint = [];
        for (let pointIndex = 0; points[pointIndex] && controlPointsCounter <= lastControlPoint; pointIndex++) {
            const point = points[pointIndex];
            if (point.length > 3) {
                const centerOfArc = this.getPointOnEllipse(point[0], point[1], +point[2] + Math.PI, point[4], lastPoint[0], lastPoint[1]);
                if (controlPointsCounter === lastControlPoint) {
                    const percent = (shiftLength - counter) / (services.map[lastControlPoint] / 100);
                    const resultRadian = +point[2] + ((+point[3] - +point[2]) / 100 * percent);
                    return this.getPointOnEllipse(point[0], point[1], resultRadian, point[4], centerOfArc[0], centerOfArc[1]);
                }
                lastPoint = this.getPointOnEllipse(point[0], point[1], point[3], point[4], centerOfArc[0], centerOfArc[1]);
                controlPointsCounter++;
                if (controlPointsCounter === lastControlPoint) {
                    checkedCurve.push(lastPoint);
                }
                continue
            }
            if (point[2] === true || (points[pointIndex + 1] && points[pointIndex + 1].length > 3)) {
                controlPointsCounter++;
            }
            if (controlPointsCounter >= lastControlPoint) {
                checkedCurve.push(point);
            }
            lastPoint = point;
        }
        return this.getPointOnCurve(
            (shiftLength - counter) / (services.map[lastControlPoint] / 100),
            checkedCurve
        );
    }
};

export function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomRGB (min, max) {
    return 'rgb(' + random(min, max ) + ',' + random(min, max) + ',' + random(min, max) + ')';
}

function isNotNegativeNumber (value) {
    return typeof +value === 'number' && +value >= 0
}

function isHEXColor (string) {
    return (string.length === 7 && string.search(/#[0-9a-f]{6}/i) === 0) || (string.length === 4 && string.search(/#[0-9a-f]{3}/i) === 0)
}

function isRGB (string) {
    return string.search(/rgb\(( ?\d{1,3},){2} ?\d{1,3}\)/i) === 0
}

function isRGBA (string) {
    return string.search(/rgba\(( ?\d{1,3},){3}( ?\d(\.\d+)?)\)/i) === 0
}

function isColor (string) {
    return isHEXColor(string) || isRGB(string) || isRGBA(string);
}
