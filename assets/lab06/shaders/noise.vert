#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 aVertexPosition;
attribute vec2 aTexturePosition;
varying vec2 vTextureCoord;

void main() {
	gl_Position = vec4(aVertexPosition, 0.0, 1.0);
	vTextureCoord = aTexturePosition; // not used in fragment shader
}