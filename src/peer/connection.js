import Peer from 'peerjs';
import { stateMessage, errorMessage } from './protocol.js';
import { getSnapshot, onStateChange } from '../game/state.js';

let hostPeer = null;
let remoteConn = null;
let remotePeerInstance = null;
let hostConn = null;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BINGO-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function sendState() {
  if (!remoteConn || !remoteConn.open) return;
  remoteConn.send(stateMessage(getSnapshot()));
}

export function sendError(message) {
  if (!remoteConn || !remoteConn.open) return;
  remoteConn.send(errorMessage(message));
}

export function destroyHostPeer() {
  if (remoteConn) { remoteConn.close(); remoteConn = null; }
  if (hostPeer) { hostPeer.destroy(); hostPeer = null; }
}

export function initHostPeer({ onReady, onRemoteConnect, onRemoteDisconnect, onRemoteCommand }) {
  const roomCode = generateRoomCode();
  hostPeer = new Peer(roomCode);

  onStateChange(sendState);

  hostPeer.on('open', (id) => onReady(id));

  hostPeer.on('connection', (conn) => {
    if (remoteConn) remoteConn.close();
    remoteConn = conn;

    conn.on('open', () => {
      onRemoteConnect();
      sendState();
    });
    conn.on('data', (msg) => onRemoteCommand(msg));
    conn.on('close', () => {
      remoteConn = null;
      onRemoteDisconnect();
    });
  });

  hostPeer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      hostPeer.destroy();
      initHostPeer({ onReady, onRemoteConnect, onRemoteDisconnect, onRemoteCommand });
    }
  });
}

export function initRemotePeer(roomCode, { onConnected, onDisconnected, onMessage, onError }) {
  remotePeerInstance = new Peer();

  remotePeerInstance.on('open', () => {
    hostConn = remotePeerInstance.connect(roomCode, { reliable: true });

    hostConn.on('open', () => onConnected());
    hostConn.on('data', (msg) => onMessage(msg));
    hostConn.on('close', () => onDisconnected());
  });

  remotePeerInstance.on('error', () => onError());
}

export function sendCommand(type) {
  if (hostConn && hostConn.open) hostConn.send({ type });
}

export function sendManualNumber(number) {
  if (hostConn && hostConn.open) hostConn.send({ type: 'manual', number });
}
