export const MSG = {
  STATE: 'state',
  ERROR: 'error',
  DRAW: 'draw',
  MANUAL: 'manual',
  UNDO: 'undo',
  REMOVE: 'remove',
  RESET: 'reset',
};

export function stateMessage(snapshot) {
  return { type: MSG.STATE, ...snapshot };
}

export function errorMessage(message) {
  return { type: MSG.ERROR, message };
}
