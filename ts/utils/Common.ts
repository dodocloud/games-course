export function colorToNumber(colorString: string) {
    colorString = colorString.replace('#', '');

    if (colorString.length == 3) {
        colorString = colorString.charAt(0) + colorString.charAt(0)
            + colorString.charAt(1) + colorString.charAt(1)
            + colorString.charAt(2) + colorString.charAt(2);
    }

    return parseInt(colorString, 16);
};