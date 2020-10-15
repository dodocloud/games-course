// new component
public class Health extends Component {
   public int health;
   public int damage;
}

// new archetype
Archetype dragonArchetype = 
	new ArchetypeBuilder()
    .add(Flaming.class).add(Health.class).build(world);

public class MovementSystem extends EntityProcessingSystem { 
    public MovementSystem() { super(Aspect.all(Position.class, Velocity.class)); } 
}

// create new transmuter
this.transmuter = new EntityTransmuterFactory(world)
	.add(FrozenFlame.class).remove(Flaming.class).build();

// apply transformation to entity
this.transmuter.transmute(entity);