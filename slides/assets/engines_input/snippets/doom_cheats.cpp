// Returns 1 if the cheat was successful, 0 if failed.
int cht_CheckCheat(cheatseq_t* cht, char key ) {
    int i;
    int rc = 0;
 
    if (firsttime) {
      firsttime = 0;
      for (i=0;i<256;i++) cheat_xlate_table[i] = SCRAMBLE(i);
    }
 
    // initialize if first time
    if (!cht->p) cht->p = cht->sequence;
    if (*cht->p == 0) *(cht->p++) = key;
    else if (cheat_xlate_table[(unsigned char)key] == *cht->p) cht->p++;
    else cht->p = cht->sequence;
 
    if (*cht->p == 1) cht->p++;
    else if (*cht->p == 0xff) { // end of sequence character
        cht->p = cht->sequence;
@H      rc = 1;
    }
    return rc;
}