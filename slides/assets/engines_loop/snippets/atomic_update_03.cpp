void Engine::Update() { 
    VariantMap& eventData = GetEventDataMap();
    eventData[P_TIMESTEP] = timeStep_;
    SendEvent(E_UPDATE, eventData);
 
    // Logic post-update event
    SendEvent(E_POSTUPDATE, eventData);
    // Rendering update event
    SendEvent(E_RENDERUPDATE, eventData);
    // Post-render update event
    SendEvent(E_POSTRENDERUPDATE, eventData);
}
 
void Engine::Render() {
    // If device is lost, BeginFrame will fail and we skip rendering
    Graphics* graphics = GetSubsystem<Graphics>();
    if (!graphics->BeginFrame()) return;
 
    GetSubsystem<Renderer>()->Render();
    GetSubsystem<UI>()->Render();
    graphics->EndFrame();
}