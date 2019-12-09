#ifdef GL_ES
precision highp float;
#endif

uniform int maxIteration;
uniform sampler2D colorPalette;

varying vec2 v_TextureCoord;

const int loopLimit = 1024;

void main() {
	vec2 c = v_TextureCoord;
	vec2 z = v_TextureCoord;
	int iteration = 0;
	for(int i = 0; i < loopLimit; i++) {
		float x = (z.x * z.x - z.y * z.y) + c.x;
		float y = (z.y * z.x + z.x * z.y) + c.y;
		if((x * x + y * y) > 4.0 || iteration == maxIteration) break;
		z.x = x;
		z.y = y;
		iteration++;
	}
	gl_FragColor = (iteration == maxIteration ? vec4(0.0, 0.0, 0.0, 1.0) : texture2D(colorPalette, vec2(float(iteration)) / float(maxIteration), 0.0));
}