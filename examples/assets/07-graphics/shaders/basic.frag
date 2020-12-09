uniform sampler2D texture;

varying vec2 vTextureCoord;

void main(void){
   gl_FragColor = texture2D(texture, vTextureCoord);
}