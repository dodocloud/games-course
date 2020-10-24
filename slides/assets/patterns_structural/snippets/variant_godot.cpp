#define GODOT_VARIANT_SIZE (16 + sizeof(int64_t))

typedef struct {
	uint8_t _dont_touch_that[GODOT_VARIANT_SIZE];
} godot_variant;

typedef enum godot_variant_type {
	// atomic types
	GODOT_VARIANT_TYPE_NIL,
	GODOT_VARIANT_TYPE_BOOL,
	GODOT_VARIANT_TYPE_INT,
	...