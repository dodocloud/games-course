void() PlayerDie = {
	DropBackpack();
	
	self.weaponmodel="";
	self.view_ofs = '0 0 -8';
	self.deadflag = DEAD_DYING;
	self.solid = SOLID_NOT;
	self.flags = self.flags - (self.flags & FL_ONGROUND);
	self.movetype = MOVETYPE_TOSS;

	if (self.velocity_z < 10)
		self.velocity_z = self.velocity_z + random()*300;

	DeathSound();
		
	if (self.weapon == IT_AXE) {
		player_die_ax1 ();
		return;
	}
	
	i = 1 + floor(random()*6);
	if (i == 1)
		player_diea1();
	else if (i == 2)
		player_dieb1();
	else player_diec1();
};