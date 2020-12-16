precision highp float;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

attribute vec2 aVertexPosition;
attribute vec2 aTexturePosition;

varying vec2 v_TextureCoord;

void main() {
    v_TextureCoord = aTexturePosition;

    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}