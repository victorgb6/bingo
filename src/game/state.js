import { TOTAL_NUMBERS } from './constants.js';

export const drawn = new Set();
export const order = [];
export let manualMode = false;
export let drawing = false;

const listeners = [];
export function onStateChange(fn) { listeners.push(fn); }
function notify() { listeners.forEach(fn => fn()); }

export function setManualMode(val) { manualMode = val; }

export function setDrawing(val) {
  drawing = val;
  notify();
}

export function addNumber(num) {
  drawn.add(num);
  order.push(num);
  notify();
}

export function removeNumberFromState(num) {
  drawn.delete(num);
  const idx = order.indexOf(num);
  if (idx !== -1) order.splice(idx, 1);
  notify();
}

export function undoLastFromState() {
  if (order.length === 0) return null;
  const num = order.pop();
  drawn.delete(num);
  notify();
  return num;
}

export function resetState() {
  drawn.clear();
  order.length = 0;
  notify();
}

export function getRemaining() {
  const remaining = [];
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    if (!drawn.has(i)) remaining.push(i);
  }
  return remaining;
}

export function getLastDrawn() {
  return order.length > 0 ? order[order.length - 1] : null;
}

export function getSnapshot() {
  return {
    drawn: Array.from(drawn),
    order: [...order],
    current: getLastDrawn(),
    total: TOTAL_NUMBERS,
    drawing,
  };
}
