// p_saveg.c::P_UnArchiveThinkers 
while (1) {
  tclass = *save_p++;
  switch (tclass) {   
    case tc_mobj:
      PADSAVEP();
      mobj = Z_Malloc (sizeof(*mobj), PU_LEVEL, NULL);
      memcpy (mobj, save_p, sizeof(*mobj));
      save_p += sizeof(*mobj);
      mobj->state = &states[(int)mobj->state];
      mobj->target = NULL;
      if (mobj->player) {
        mobj->player = &players[(int)mobj->player-1];
        mobj->player->mo = mobj;
      }
      P_SetThingPosition (mobj);
      mobj->info = &mobjinfo[mobj->type];
      P_AddThinker (&mobj->thinker);