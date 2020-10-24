
public async Task EnterDoorAction(Door door) {
	this.Context.Player.BlockInput();
	await new DoorAnimation(door).Open();
	await new WalkAnimation(this.Context.Player).Walk(this.Context.Player.direction);
	this.Context.Player.Hide(); // hide the sprite once it approaches the house
	await new DoorAnimation(door).Close();
	await Delay(500); // wait for 500 ms
}

.......

public async Task OnPlayerDoorApproached(Door door) {
	await new EnterDoorAction(door);
	await new SceneLoader(door.TargetScene);
}