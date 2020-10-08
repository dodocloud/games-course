RES ResourceLoader::_load(const String &p_path, const String &p_original_path, 
    const String &p_type_hint, bool p_no_cache, Error *r_error, bool p_use_sub_threads, 
	float *r_progress) {
	bool found = false;

	// Try all loaders and pick the first match for the type hint
	for (int i = 0; i < loader_count; i++) {
		if (!loader[i]->recognize_path(p_path, p_type_hint)) {
			continue;
		}
		found = true;
		RES res = loader[i]->load(p_path, p_original_path != String() ? 
			p_original_path : p_path, r_error, p_use_sub_threads, r_progress, p_no_cache);
		if (res.is_null()) {
			continue;
		}

		return res;
	}

	ERR_FAIL_COND_V_MSG(found, RES(), vformat("Failed loading resource: %s.", p_path));
}