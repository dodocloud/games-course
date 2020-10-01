bool Main::iteration() {
	iterating++;

	uint64_t ticks = OS::get_singleton()->get_ticks_usec();
	Engine::get_singleton()->_frame_ticks = ticks;
	// update elapsed ticks
	// ...
	MainFrameTime advance = main_timer_sync.advance(frame_slice, physics_fps);

	for (int iters = 0; iters < advance.physics_steps; ++iters) {
		// ... update PhysicsServer3D		
	}

	if (DisplayServer::get_singleton()->can_any_window_draw()) {
		// ... draw frame
	}

	for (int i = 0; i < ScriptServer::get_language_count(); i++) {
		// ... update scene for each scripting language
		ScriptServer::get_language(i)->frame();
	}

	AudioServer::get_singleton()->update();
	frames++;
	return exit || auto_quit;
}