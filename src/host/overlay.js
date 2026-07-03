import { $ } from '../ui/dom.js';

export function showOverlay(num, onComplete) {
  const overlay = $('overlay');
  const overlayNum = $('overlayNumber');
  overlayNum.textContent = num;
  overlay.classList.add('visible');

  setTimeout(() => {
    overlay.classList.remove('visible');
    onComplete();
  }, 3000);
}
