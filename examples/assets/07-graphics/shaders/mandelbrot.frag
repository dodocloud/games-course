precision highp float;

uniform int maxIteration;
uniform sampler2D colorPalette;

varying vec2 v_TextureCoord;

const int loopLimit = 1024;

void main() {
    vec2 c = v_TextureCoord;
    vec2 z = vec2(0.0, 0.0);

    int iteration = 0;
    // z_n+1 = z_n^2 + c
    for(int i = 0; i < loopLimit; i++) {
        // z * z = (x*x - y*y) + (x*y + x*y)i
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (2.0 * z.x * z.y) + c.y;

        if((x * x + y * y) > 4.0 || i == maxIteration) {
            break;
        }

        z.x = x;
        z.y = y;
        iteration++;
    }

    if(iteration == maxIteration) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = texture2D(colorPalette, vec2(float(iteration) / float(maxIteration) ,0.0));
    }
}