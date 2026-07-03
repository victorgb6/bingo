import './style.css';
import { startHost } from './host/host.js';
import { startRemote } from './remote/remote.js';

const params = new URLSearchParams(window.location.search);
const roomCode = params.get('remote');

if (roomCode) {
  startRemote(roomCode);
} else {
  startHost();
}
