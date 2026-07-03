let wakeLock = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

export function initFullscreen() {
  const btn = document.getElementById('fullscreenBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    document.getElementById('fsIconExpand').style.display = isFs ? 'none' : '';
    document.getElementById('fsIconShrink').style.display = isFs ? '' : 'none';
    if (isFs) requestWakeLock(); else releaseWakeLock();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.fullscreenElement) requestWakeLock();
  });
}
