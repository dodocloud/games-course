boolean P_CheckMissileRange (mobj_t* actor){   
    if (!P_CheckSight(actor, actor->target))
    return false; // can’t see the target
   
    if ( actor->flags & MF_JUSTHIT ) {
    // just hit -> fight back!
      actor->flags &= ~MF_JUSTHIT;
      return true;
    }
   
    if (actor->reactiontime)
    return false; // do not attack yet
   
    dist = P_AproxDistance (actor, target)
    - 64*FRACUNIT;
   
    // no melee attack, so fire more
    if (!actor->info->meleestate)
     dist -= 128*FRACUNIT; 
  
    // check for ARCH-VILE
    if (actor->type == MT_VILE){
      if (dist > 14*64)
         return false;  // too far away
    }
}