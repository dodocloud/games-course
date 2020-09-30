void() DeathSound = {
    local float rs;
 
    // water death sounds
    if (self.waterlevel == 3) {
        DeathBubbles(5);
        sound (self, CHAN_VOICE,
        "player/h2odeath.wav", 1, ATTN_NONE);
        return;
    }
   
    rs = rint ((random() * 4) + 1);
    if (rs == 1)
        self.noise = "player/death1.wav";
    if (rs == 2)
        self.noise = "player/death2.wav";
    if (rs == 3)
        self.noise = "player/death3.wav";
    if (rs == 4)
        self.noise = "player/death4.wav";
    if (rs == 5)
        self.noise = "player/death5.wav";
 
    sound (self, CHAN_VOICE, self.noise, 1, ATTN_NONE);
    return;
};