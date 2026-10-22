import { privateSDK } from './secure-sdk.js';
const random = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('');
export function invitation() {
  if (!location.hash) history.replaceState(null, '', location.pathname + location.search + '#v1.' + random(18) + '.' + random(32));
  const match = /^#v1\.([0-9a-f]{36})\.([0-9a-f]{64})$/.exec(location.hash);
  return match ? { room: match[1], secret: match[2] } : null;
}
class Track extends EventTarget {
  constructor(track, id = 'self') { super(); this.track = track; this.id = id; this.muted = false; }
  isMuted() { return !this.track.enabled || this.muted; }
  getType() { return this.track.kind; }
  getId() { return this.track.id; }
  getParticipantId() { return this.id; }
  attach(el) { el.srcObject = new MediaStream([this.track]); }
  detach(el) { el.srcObject = null; }
  on(name, handler) { this.addEventListener(name, handler); }
  update(muted) { this.muted = muted; this.dispatchEvent(new Event('mute')); }
}
export class VdoCall extends EventTarget {
  constructor(invite) {
    super(); this.invite = invite; this.local = new Map(); this.remote = new Map(); this.closed = false;
    this.sdk = { events: { track: { TRACK_MUTE_CHANGED: 'mute' } } };
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  async acquire(kind) {
    if (!this.invite) throw new Error('Invalid invitation');
    if (this.local.has(kind)) return this.local.get(kind);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: kind === 'audio', video: kind === 'video' ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false });
    const raw = stream.getTracks()[0];
    if (this.closed) { raw.stop(); return null; }
    const track = new Track(raw); this.local.set(kind, track);
    raw.addEventListener('ended', () => { track.update(true); this.emit('stopped', kind); });
    if (this.vdo?.state.publishing) await this.vdo.addTrack(raw, this.media);
    return track;
  }
  async connect() {
    if (this.vdo || this.closed) return;
    if (!this.invite) throw new Error('Invalid invitation');
    const { room, secret } = this.invite;
    const vdo = this.vdo = privateSDK(secret, room, { forceTURN: new URLSearchParams(location.search).get('relay') === '1' });
    const id = 'qc_' + random(12), viewed = new Set(), discovered = new Set();
    const view = async sid => {
      if (!sid || sid === id || viewed.has(sid) || this.closed) return;
      discovered.add(sid);
      if (!vdo.state.publishing) return;
      viewed.add(sid);
      try { await vdo.view(sid, { audio: true, video: true }); }
      catch { viewed.delete(sid); if (!this.closed) this.emit('error'); }
    };
    vdo.addEventListener('listing', ({ detail }) => {
      for (const item of detail.list || []) view(typeof item === 'string' ? item : item.streamID);
      if (detail.streamID) view(detail.streamID);
    });
    vdo.addEventListener('streamAdded', ({ detail }) => view(detail.streamID));
    vdo.addEventListener('track', ({ detail }) => {
      const track = new Track(detail.track, detail.uuid);
      const key = detail.uuid + ':' + detail.track.kind;
      if (this.remote.has(key)) this.emit('removed', this.remote.get(key));
      this.remote.set(key, track); this.emit('remote', track);
    });
    const left = detail => {
      const uuid = detail.uuid || detail.UUID;
      for (const [key, track] of this.remote) if (track.id === uuid) this.remote.delete(key);
      this.emit('left', uuid);
      // Permit the same peer to reconnect after a transient disconnect.
      if (detail.streamID) viewed.delete(detail.streamID);
    };
    vdo.addEventListener('userLeft', ({ detail }) => left(detail));
    vdo.addEventListener('peerDisconnected', ({ detail }) => left(detail));
    vdo.addEventListener('dataChannelOpen', () => this.sendMute());
    vdo.addEventListener('dataReceived', ({ detail }) => {
      const state = detail.data?.quietMute;
      if (!state) return;
      for (const kind of ['audio', 'video']) this.remote.get(detail.uuid + ':' + kind)?.update(state[kind] === true);
    });
    vdo.addEventListener('securityError', () => { this.emit('error'); this.end(); });
    vdo.addEventListener('error', () => { if (!this.closed) this.emit('error'); });
    vdo.addEventListener('disconnected', () => { if (!this.closed) this.emit('interrupted'); });
    this.media = new MediaStream([...this.local.values()].map(t => t.track));
    await vdo.connect();
    if (this.closed) return;
    await vdo.publish(this.media, { room, streamID: id });
    for (const sid of discovered) view(sid);
    if (!this.closed) this.emit('joined');
  }
  sendMute() {
    this.vdo?.sendData({ quietMute: Object.fromEntries(['audio', 'video'].map(k => [k, !this.local.has(k) || this.local.get(k).isMuted()])) });
  }
  async toggle(kind) {
    let track = this.local.get(kind);
    if (!track) track = await this.acquire(kind);
    else track.track.enabled = !track.track.enabled;
    this.sendMute(); return track;
  }
  async end() {
    if (this.closed) return;
    this.closed = true;
    for (const t of this.local.values()) t.track.stop();
    this.local.clear();
    try { await this.vdo?.disconnect(); } catch { /* Offline. */ }
  }
}
