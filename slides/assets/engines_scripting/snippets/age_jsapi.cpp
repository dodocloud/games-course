// Duktape JS mapping
static void jsb_class_define_FileSystem(JSVM* vm) {
  duk_context* ctx = vm->GetJSContext();
  js_class_get_constructor(ctx, "Atomic", "FileSystem");
  js_class_get_prototype(ctx, "Atomic", "FileSystem");
  duk_pop_2(ctx);
  js_class_get_prototype(ctx, "Atomic", "FileSystem");
  duk_push_c_function(ctx, jsb_class_FileSystem_SetCurrentDir, 1);
  duk_put_prop_string(ctx, -2, "setCurrentDir");
  duk_push_c_function(ctx, jsb_class_FileSystem_CreateDir, 1);
  duk_put_prop_string(ctx, -2, "createDir");
...
}
 
// CreateDir method
static int jsb_class_FileSystem_CreateDir(duk_context* ctx) {
  String __arg0 = duk_to_string(ctx, 0);
  duk_push_this(ctx);
  FileSystem* native = js_to_class_instance<FileSystem>(ctx, -1, 0);
  bool retValue = native->CreateDir(__arg0);
  duk_push_boolean(ctx, retValue ? 1 : 0);
  return 1;
}