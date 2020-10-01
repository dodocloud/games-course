PoolAllocator::ID PoolAllocator::alloc(int p_size) {
	int size_to_alloc = aligned(p_size);

	EntryIndicesPos new_entry_indices_pos;

	if (!find_hole(&new_entry_indices_pos, size_to_alloc)) {
		/* No hole could be found, try compacting mem */
		compact();
		/* Then search again */
		if (!find_hole(&new_entry_indices_pos, size_to_alloc)) {
			ERR_FAIL_V_MSG(POOL_ALLOCATOR_INVALID_ID, "Memory can't be compacted further.");
		}
	}
	EntryArrayPos new_entry_array_pos;
	bool found_free_entry = get_free_entry(&new_entry_array_pos);

	if (!found_free_entry) {
		ERR_FAIL_V_MSG(POOL_ALLOCATOR_INVALID_ID, "No free entry found in PoolAllocator.");
	}
    // ... move all entry indices up and allocate the entry
    // ...
	return retval;
}