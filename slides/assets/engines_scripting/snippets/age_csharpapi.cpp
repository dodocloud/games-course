ATOMIC_EXPORT_API bool csb_Atomic_FileSystem_SetCurrentDir_4667(FileSystem* self, const char* pathName)
{ 
   return self->SetCurrentDir(pathName ? String(pathName) : String::EMPTY);
}
 
 
ATOMIC_EXPORT_API bool csb_Atomic_FileSystem_CreateDir_4668(FileSystem* self, const char* pathName)
{
   return self->CreateDir(pathName ? String(pathName) : String::EMPTY);
}
 
 
ATOMIC_EXPORT_API void csb_Atomic_FileSystem_SetExecuteConsoleCommands_4669(FileSystem* self, bool enable)
{
   self->SetExecuteConsoleCommands(enable);
}