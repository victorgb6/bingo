import { TOTAL_NUMBERS, FLAG_COLORS } from '../game/constants.js';
import {
  drawn, order, manualMode, drawing,
  setManualMode, setDrawing,
  addNumber, removeNumberFromState, undoLastFromState, resetState,
  getRemaining, getLastDrawn,
} from '../game/state.js';
import { initHostPeer, destroyHostPeer, sendError } from '../peer/connection.js';
import { MSG } from '../peer/protocol.js';
import { showOverlay } from './overlay.js';
import { renderHistory } from '../ui/history.js';
import { initFullscreen } from '../ui/fullscreen.js';
import { $, updateStats, updateCurrentNumber, animateCurrentNumber, updateDrawButtons } from '../ui/dom.js';
import QRCode from 'qrcode';

function getColor(num) {
  return FLAG_COLORS[Math.floor((num - 1) / 10)];
}

function updateUndoBtn() {
  $('undoBtn').disabled = order.length === 0;
}

function updateCellDrawn(num) {
  const c = getColor(num);
  const cell = $('cell-' + num);
  cell.classList.add('drawn', 'just-drawn');
  cell.style.background = c.bg;
  cell.style.boxShadow = '0 0 10px ' + c.glow;
  if (c.dark) cell.style.color = '#1a0a2e';
  setTimeout(() => cell.classList.remove('just-drawn'), 600);
}

function clearCellDrawn(num) {
  const cell = $('cell-' + num);
  cell.classList.remove('drawn');
  cell.style.background = '';
  cell.style.boxShadow = '';
  cell.style.color = '';
}

function revealNumber(num) {
  setDrawing(true);
  updateDrawButtons(true);
  addNumber(num);

  showOverlay(num, () => {
    updateCellDrawn(num);
    updateCurrentNumber(num);
    animateCurrentNumber();
    updateStats(drawn.size, TOTAL_NUMBERS);
    renderHistory();
    updateUndoBtn();

    setDrawing(false);
    if (drawn.size < TOTAL_NUMBERS) {
      updateDrawButtons(false);
    }
    if (manualMode) $('manualNumber').focus();
  });
}

function drawNumber() {
  if (drawing) return;
  const remaining = getRemaining();
  if (remaining.length === 0) return;
  const num = remaining[Math.floor(Math.random() * remaining.length)];
  revealNumber(num);
}

function submitManual() {
  if (drawing) return;
  const input = $('manualNumber');
  const errorEl = $('manualError');
  const num = parseInt(input.value, 10);

  if (isNaN(num) || num < 1 || num > TOTAL_NUMBERS) {
    errorEl.textContent = 'Enter 1-90';
    return;
  }
  if (drawn.has(num)) {
    errorEl.textContent = 'Already drawn';
    return;
  }
  errorEl.textContent = '';
  input.value = '';
  revealNumber(num);
}

function undoLast() {
  if (drawing || order.length === 0) return;
  const num = undoLastFromState();
  if (num === null) return;
  clearCellDrawn(num);
  updateCurrentNumber(getLastDrawn());
  updateStats(drawn.size, TOTAL_NUMBERS);
  updateDrawButtons(false);
  renderHistory();
  updateUndoBtn();
  $('manualError').textContent = '';
}

function removeNumber(num) {
  removeNumberFromState(num);
  clearCellDrawn(num);
  updateCurrentNumber(getLastDrawn());
  updateStats(drawn.size, TOTAL_NUMBERS);
  updateDrawButtons(false);
  renderHistory();
  updateUndoBtn();
}

function toggleMode() {
  setManualMode(!manualMode);
  $('modeToggle').classList.toggle('on', manualMode);
  $('labelRandom').classList.toggle('active', !manualMode);
  $('labelManual').classList.toggle('active', manualMode);
  $('randomControls').style.display = manualMode ? 'none' : '';
  $('manualControls').style.display = manualMode ? 'flex' : 'none';
  $('manualError').textContent = '';
  document.body.classList.toggle('manual-active', manualMode);
  if (manualMode) $('manualNumber').focus();
}

function resetGame() {
  resetState();
  updateCurrentNumber(null);
  updateStats(0, TOTAL_NUMBERS);
  $('drawBtn').disabled = false;
  $('history').innerHTML = '';
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('drawn', 'just-drawn');
    c.style.background = '';
    c.style.boxShadow = '';
    c.style.color = '';
  });
  updateUndoBtn();
}

function initBoard() {
  const board = $('board');
  board.innerHTML = '';
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = 'cell-' + i;
    cell.textContent = i;
    const xBtn = document.createElement('button');
    xBtn.className = 'cell-x';
    xBtn.textContent = '✕';
    xBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (manualMode && !drawing && drawn.has(i)) removeNumber(i);
    });
    cell.appendChild(xBtn);
    board.appendChild(cell);
  }
}

function handleRemoteCommand(msg) {
  switch (msg.type) {
    case MSG.DRAW:
      if (!drawing && drawn.size < TOTAL_NUMBERS) drawNumber();
      break;
    case MSG.MANUAL:
      if (drawing) break;
      if (msg.number < 1 || msg.number > TOTAL_NUMBERS) {
        sendError('Enter 1-90');
      } else if (drawn.has(msg.number)) {
        sendError('Already drawn');
      } else {
        revealNumber(msg.number);
      }
      break;
    case MSG.UNDO:
      undoLast();
      break;
    case MSG.REMOVE:
      if (drawn.has(msg.number)) removeNumber(msg.number);
      break;
    case MSG.RESET:
      resetGame();
      break;
  }
}

async function initConnectionPanel(peerId) {
  $('roomCodeDisplay').textContent = peerId;
  $('statusText').textContent = 'Scan to connect';
  const remoteUrl = window.location.origin + window.location.pathname + '?remote=' + peerId;
  const canvas = document.createElement('canvas');
  $('qrCode').appendChild(canvas);
  await QRCode.toCanvas(canvas, remoteUrl, {
    width: 120,
    color: { dark: '#1a0a2e', light: '#ffffff' },
  });
}

function wireControls() {
  $('drawBtn').addEventListener('click', drawNumber);
  $('modeToggle').addEventListener('click', toggleMode);
  $('manualNumber').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitManual(); });
  $('manualSubmitBtn').addEventListener('click', submitManual);
  $('undoBtn').addEventListener('click', undoLast);
  $('hostResetBtn').addEventListener('click', resetGame);
}

let remoteEnabled = false;

function enableRemote() {
  remoteEnabled = true;
  $('connectionPanel').style.display = '';
  $('remoteToggle').classList.add('on');

  initHostPeer({
    onReady: (id) => initConnectionPanel(id),
    onRemoteConnect: () => {
      $('statusDot').classList.add('connected');
      $('statusText').textContent = 'Remote connected';
      document.body.classList.add('remote-connected');
      $('connectionPanel').style.display = 'none';
      $('settingsPanel').classList.remove('open');
      $('settingsBtn').style.display = 'none';
    },
    onRemoteDisconnect: () => {
      $('statusDot').classList.remove('connected');
      $('statusText').textContent = 'Remote disconnected';
      document.body.classList.remove('remote-connected');
      $('connectionPanel').style.display = '';
      $('settingsBtn').style.display = '';
    },
    onRemoteCommand: handleRemoteCommand,
  });
}

function disableRemote() {
  remoteEnabled = false;
  $('connectionPanel').style.display = 'none';
  $('remoteToggle').classList.remove('on');
  document.body.classList.remove('remote-connected');
  destroyHostPeer();
  $('qrCode').innerHTML = '';
  $('roomCodeDisplay').textContent = '';
  $('statusText').textContent = 'Generating...';
  $('statusDot').classList.remove('connected');
}

function wireSettings() {
  const btn = $('settingsBtn');
  const panel = $('settingsPanel');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('open');
    }
  });

  $('remoteToggle').addEventListener('click', () => {
    if (remoteEnabled) {
      disableRemote();
    } else {
      enableRemote();
    }
  });
}

export function startHost() {
  initBoard();
  wireControls();
  wireSettings();
  initFullscreen();
}
