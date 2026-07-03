export const $ = (id) => document.getElementById(id);

export function updateStats(drawnCount, total) {
  $('drawnCount').textContent = drawnCount;
  $('remainingCount').textContent = total - drawnCount;
}

export function updateCurrentNumber(num) {
  $('currentNumber').querySelector('span').textContent = num ?? '--';
}

export function animateCurrentNumber() {
  const display = $('currentNumber');
  display.classList.remove('pop');
  void display.offsetWidth;
  display.classList.add('pop');
}

export function updateDrawButtons(disabled) {
  document.querySelectorAll('.draw-btn').forEach(b => b.disabled = disabled);
}
