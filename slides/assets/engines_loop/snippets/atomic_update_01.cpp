int Application::Run() {
        Setup();
        if (!engine_->Initialize(engineParameters_)) {
            return ErrorExit();
        }
 
        Start();
 
#if !defined(IOS) && !defined(__EMSCRIPTEN__)
        while (!engine_->IsExiting())
@H          engine_->RunFrame();
        Stop();
#else
#if defined(IOS)
        SDL_iPhoneSetAnimationCallback(GetWindow(), 1, &RunFrame, engine_);
#elif defined(__EMSCRIPTEN__)
        emscripten_set_main_loop_arg(RunFrame, engine_, 0, 1);
#endif
#endif
        return exitCode_;
}