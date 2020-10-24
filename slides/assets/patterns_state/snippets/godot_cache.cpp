void AnimationCache::_clear_cache() {
	while (connected_nodes.size()) {
		connected_nodes.front()->get()
			->disconnect("tree_exiting", callable_mp(this, &AnimationCache::_node_exit_tree));
		connected_nodes.erase(connected_nodes.front());
	}
	path_cache.clear();
	cache_valid = false;
@H	cache_dirty = true;
}

void AnimationCache::_update_cache() {
	cache_valid = false;

	for (int i = 0; i < animation->get_track_count(); i++) {
		// ... 100 lines of code
	}

@H	cache_dirty = false;
	cache_valid = true;
}
