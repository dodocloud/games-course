#ifdef GL_ES
precision highp float;
#endif

// variables from PIXI
attribute vec2 aVertexPosition;
attribute vec2 aTexturePosition;
uniform mat3 translationMatrix;
// variable for fragment shader
varying vec2 vTextureCoord;

void main() {
	vTextureCoord = aTexturePosition;
  gl_Position = vec4((translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}