class Builder {
  private _position: Vector;
  private _scale: Vector;
 
  position(pos: Vector) {
    this.position = pos;
    return this;
  }
 
  scale(scale: Vector) {
    this.scale = scale;
    return this;
  }
 
  build() {
    return new GameObject(this._position, this._scale);
  }
}
 
new Builder().position(new Vector(12, 54)).scale(new Vector(2, 1)).build();