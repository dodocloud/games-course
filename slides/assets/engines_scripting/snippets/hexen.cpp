script 137 (int dir)
{
    if(!dir)
    {
        Floor_LowerByValue(DoorTag, 16, 64)
        Ceiling_RaiseByValue(DoorTag, 16, 64)
        Delay(120);
        Floor_RaiseByValue(DoorTag, 16, 64)
        Ceiling_LowerByValue(DoorTag, 16, 64)
    }
}