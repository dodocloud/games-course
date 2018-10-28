export const MSG_OBJECT_ADDED = "MSG_OBJECT_ADDED";
export const MSG_OBJECT_REMOVED = "MSG_OBJECT_REMOVED";
export const MSG_ALL = "MSG_ALL";  // special message for global subscribers, usually for debugging

export const STATE_INACTIVE = 0;
export const STATE_UPDATABLE = 2 ^ 0;
export const STATE_DRAWABLE = 2 ^ 1;
export const STATE_LISTENING = 2 ^ 2;
