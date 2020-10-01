void Engine::RunFrame() {
    Time* time = GetSubsystem<Time>();
    Input* input = GetSubsystem<Input>();
    Audio* audio = GetSubsystem<Audio>();
 
    time->BeginFrame(timeStep_);
    // ... process input and audio
@H  Update();
 
    fpsTimeSinceUpdate_ += timeStep_;
    ++fpsFramesSinceUpdate_;
    if (fpsTimeSinceUpdate_ > ENGINE_FPS_UPDATE_INTERVAL) {
        fps_ = (int)(fpsFramesSinceUpdate_ / fpsTimeSinceUpdate_);
        fpsFramesSinceUpdate_ = 0;
        fpsTimeSinceUpdate_ = 0;
    }
    
@H  Render();
    ApplyFrameLimit();
    time->EndFrame();
}