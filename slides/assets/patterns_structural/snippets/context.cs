public void OnTriggerEvent(Event evt, Context ctx) {
	
	if(evt.Key == "LIFE_LOST") {
		ctx.Lives--; // access the context
		if(ctx.Lives <= 0) {
			this.FireEvent("GAME_OVER");	
		}
	}
}