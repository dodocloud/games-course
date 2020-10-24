const getPlayer(scene: Scene) => scene.findObjectByName('player');

const getAllUnits(scene: Scene) => scene.findObjectsByTag('unit_basic');

const getAllUnitsWithinRadius(scene: Scene, pos: Vector, radius: number) => {
	return getAllUnits(scene).filter(unit => unit.pos.distance(pos) <= radius);
}

const getAllExits(scene: Scene) => {
	const doors = scene.findObjectsByTag('door');
	return doors.filter(door => !door.locked);
}