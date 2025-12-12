const activityCallbacks = {};

export function setActivityCallback(slot, callback) {
  let slotKey;

  if (typeof slot === "object" && slot !== null && "slot" in slot) {
    slotKey = slot.slot;
  } else {
    slotKey = slot;
  }

  // Always convert to string to avoid 0 !== "0" mismatches
  slotKey = String(slotKey);
  activityCallbacks[slotKey] = callback;
}

export function triggerActivityCallback(slot, activity) {
  let slotKey;

  if (typeof slot === "object" && slot !== null && "slot" in slot) {
    slotKey = slot.slot;
  } else {
    slotKey = slot;
  }

  // Normalize to string here too
  slotKey = String(slotKey);

  if (activityCallbacks[slotKey]) {
    activityCallbacks[slotKey](activity);
    delete activityCallbacks[slotKey]; // clear after use
  } else {
    console.warn('no callback registered for slot', slotKey);
  }
};
