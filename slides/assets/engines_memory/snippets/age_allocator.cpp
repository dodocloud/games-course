void* AllocatorReserve(AllocatorBlock* allocator) {
    if (!allocator->free_) {
        // Free nodes have been exhausted. Allocate a new larger block
        unsigned newCapacity = (allocator->capacity_ + 1) >> 1;
        AllocatorReserveBlock(allocator, allocator->nodeSize_, newCapacity);
        allocator->capacity_ += newCapacity;
    }
 
    // We should have new free node(s) chained
    AllocatorNode* freeNode = allocator->free_;
    void* ptr = (reinterpret_cast<unsigned char*>(freeNode)) + sizeof(AllocatorNode);
    allocator->free_ = freeNode->next_;
    freeNode->next_ = 0;
    return ptr;
}
============================
// create node from void* and call the constructor
@HNode* newNode = static_cast<Node*>(AllocatorReserve(allocator_));
new(newNode) Node();
// ... do some stuff 
// delete node
(newNode)->~Node();
AllocatorFree(allocator_, newNode);