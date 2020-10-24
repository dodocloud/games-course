class Generator {
  static idCounter = 0;
 
  getId(): number {
    return Generator.idCounter++;
  }
}