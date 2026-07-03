import { MSG } from '../peer/protocol.js';
import { initRemotePeer, sendCommand, sendManualNumber } from '../peer/connection.js';
import { $ } from '../ui/dom.js';

let remoteManualMode = false;

function handleHostMessage(msg) {
  switch (msg.type) {
    case MSG.STATE:
      $('remoteCurrentNumber').querySelector('span').textContent = msg.current || '--';
      $('remoteDrawnCount').textContent = msg.drawn.length;
      $('remoteUndoBtn').disabled = msg.order.length === 0;
      $('remoteDrawBtn').disabled = msg.drawing || msg.drawn.length >= msg.total;
      $('remoteError').textContent = '';
      break;
    case MSG.ERROR:
      $('remoteError').textContent = msg.message;
      break;
  }
}

function toggleRemoteMode() {
  remoteManualMode = !remoteManualMode;
  $('remoteModeToggle').classList.toggle('on', remoteManualMode);
  $('remoteLabelRandom').classList.toggle('active', !remoteManualMode);
  $('remoteLabelManual').classList.toggle('active', remoteManualMode);
  $('remoteRandomControls').style.display = remoteManualMode ? 'none' : '';
  $('remoteManualControls').style.display = remoteManualMode ? 'flex' : 'none';
}

function handleManualSubmit() {
  const input = $('remoteManualNumber');
  const num = parseInt(input.value, 10);
  if (isNaN(num) || num < 1 || num > 90) {
    $('remoteError').textContent = 'Enter 1-90';
    return;
  }
  input.value = '';
  $('remoteError').textContent = '';
  sendManualNumber(num);
}

function wireRemoteControls() {
  $('remoteDrawBtn').addEventListener('click', () => sendCommand(MSG.DRAW));
  $('remoteModeToggle').addEventListener('click', toggleRemoteMode);
  $('remoteManualNumber').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleManualSubmit(); });
  $('remoteManualSubmitBtn').addEventListener('click', handleManualSubmit);
  $('remoteUndoBtn').addEventListener('click', () => sendCommand(MSG.UNDO));
  $('remoteResetBtn').addEventListener('click', () => {
    if (confirm('Reset the entire game?')) sendCommand(MSG.RESET);
  });
}

export function startRemote(roomCode) {
  document.querySelectorAll('body > *:not(#remoteUI):not(.overlay)').forEach(el => {
    el.style.display = 'none';
  });
  $('remoteUI').style.display = 'flex';

  wireRemoteControls();

  initRemotePeer(roomCode, {
    onConnected: () => {
      $('remoteStatusDot').classList.add('connected');
      $('remoteStatusText').textContent = 'Connected';
      $('remoteDrawBtn').disabled = false;
    },
    onDisconnected: () => {
      $('remoteStatusDot').classList.remove('connected');
      $('remoteStatusText').textContent = 'Disconnected';
      $('remoteDrawBtn').disabled = true;
      $('remoteUndoBtn').disabled = true;
    },
    onMessage: handleHostMessage,
    onError: () => {
      $('remoteStatusText').textContent = 'Connection failed';
    },
  });
}
