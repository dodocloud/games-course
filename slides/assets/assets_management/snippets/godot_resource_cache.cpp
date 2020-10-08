HashMap<String, Resource *> ResourceCache::resources;

Resource *ResourceCache::get(const String &p_path) {
	lock->read_lock();

	Resource **res = resources.getptr(p_path);

	lock->read_unlock();

	if (!res) {
		return nullptr;
	}

	return *res;
}
