// Doom 2: find player to chase
void A_Look (mobj_t* actor) {
    mobj_t* targ;
    actor->threshold = 0;   // any shot will wake up
    targ = actor->subsector->sector->soundtarget;
      if (actor->flags & MF_AMBUSH){
        if (P_CheckSight (actor, actor->target))
        goto seeyou;
    } else goto seeyou;
  
    if (!P_LookForPlayers (actor, false)) return;
    // go into chase state
seeyou:
    P_ChasePlayer();
}