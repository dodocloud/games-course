OSStatus AudioDriverCoreAudio::output_callback(...) {
	AudioDriverCoreAudio *ad = (AudioDriverCoreAudio *)inRefCon;
	...	
	for (unsigned int i = 0; i < ioData->mNumberBuffers; i++) {
		AudioBuffer *abuf = &ioData->mBuffers[i];
		unsigned int frames_left = inNumberFrames;
		int16_t *out = (int16_t *)abuf->mData;

		while (frames_left) {
			unsigned int frames = MIN(frames_left, ad->buffer_frames);
			ad->audio_server_process(frames, ad->samples_in.ptrw());

			for (unsigned int j = 0; j < frames * ad->channels; j++) {
				out[j] = ad->samples_in[j] >> 16;
			}

			frames_left -= frames;
			out += frames * ad->channels;
		};
	};
	...
	return 0;
};