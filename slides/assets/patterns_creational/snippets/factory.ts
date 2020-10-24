class UnitFactory {
	
  private pikemanBuilder: Builder; // preconfigured to build pikemans
  private musketeerBuilder: Builder; // preconfigured to build musketeers
  private archerBuilder: Builder; // preconfigured to build archers
 
  public spawnPikeman(position: Vector, faction: FactionType): GameObject {
    return this.pikeman.position(position).faction(faction).build();
  }
 
  public spawnMusketeer(position: Vector, faction: FactionType): GameObject {
    return this.musketeerBuilder.position(position).faction(faction).build();
  }
 
  public spawnArcher(position: Vector, faction: FactionType): GameObject {
    return this.archerBuilder.position(position).faction(faction).build();
  }
}