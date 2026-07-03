import { order } from '../game/state.js';

export function renderHistory() {
  const el = document.getElementById('history');
  el.innerHTML = order.map(n =>
    '<div class="history-item">' + n + '</div>'
  ).join('');
  el.scrollLeft = el.scrollWidth;
}
