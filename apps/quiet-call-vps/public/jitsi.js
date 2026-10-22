// The SDK and configuration are served by the same pinned Jitsi web container.
export class JitsiCall extends EventTarget {
  constructor(roomName) {
    super();
    this.roomName = roomName;
    this.local = new Map();
    this.remote = new Map();
    this.joined = false;
    this.closed = false;
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  async init() {
    if (this.sdk) return;
    const sdk = window.JitsiMeetJS;
    if (!sdk || !window.config) throw new Error('server');
    this.sdk = sdk;
    sdk.setLogLevel(sdk.logLevels.ERROR);
    await sdk.init({ disableAudioLevels: true, enableAnalyticsLogging: false });
  }
  async acquire(kind) {
    await this.init();
    if (this.local.has(kind)) return this.local.get(kind);
    const [track] = await this.sdk.createLocalTracks({
      devices: [kind], resolution: 720, cameraFacingMode: 'user',
      constraints: { video: { height: { ideal: 720, max: 720 }, width: { ideal: 1280, max: 1280 } } }
    });
    if (this.closed) { await track.dispose(); return null; }
    this.local.set(kind, track);
    track.on(this.sdk.events.track.LOCAL_TRACK_STOPPED, () => this.emit('stopped', kind));
    if (this.room) await this.room.addTrack(track);
    return track;
  }
  async connect() {
    await this.init();
    if (this.connection || this.closed) return;
    const c = window.config;
    // Same-origin endpoints also support localhost HTTP development; some upstream
    // config templates assume PUBLIC_URL always starts with https://.
    const websocket = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/xmpp-websocket`;
    const conn = new this.sdk.JitsiConnection(null, null, { ...c, websocket, bosh: `${location.origin}/http-bind`, serviceUrl: websocket });
    this.connection = conn;
    const ev = this.sdk.events;
    conn.addEventListener(ev.connection.CONNECTION_ESTABLISHED, async () => {
      if (this.closed) return;
      // Prefer VP8 across clients, including older Android Chrome versions.
      // Their codec APIs can reject newer scalable video modes during negotiation.
      const codecs = ['VP8', 'H264', 'VP9', 'AV1'];
      const room = conn.initJitsiConference(this.roomName, {
        ...c, openBridgeChannel: true, enableTalkWhileMuted: false,
        videoQuality: {
          ...c.videoQuality, codecPreferenceOrder: codecs, mobileCodecPreferenceOrder: codecs,
          vp8: { ...c.videoQuality?.vp8, scalabilityModeEnabled: false }
        },
        p2p: { ...c.p2p, enabled: c.p2p?.enabled ?? true, codecPreferenceOrder: codecs, mobileCodecPreferenceOrder: codecs }
      });
      this.room = room;
      room.on(ev.conference.TRACK_ADDED, track => {
        if (track.isLocal()) return;
        this.remote.set(track.getId(), track);
        this.emit('remote', track);
      });
      room.on(ev.conference.TRACK_REMOVED, track => {
        this.remote.delete(track.getId()); this.emit('removed', track);
      });
      room.on(ev.conference.USER_LEFT, id => this.emit('left', id));
      room.on(ev.conference.CONFERENCE_JOINED, () => { this.joined = true; this.emit('joined'); });
      room.on(ev.conference.CONFERENCE_FAILED, error => this.emit('error', error));
      room.on(ev.conference.CONNECTION_INTERRUPTED, () => this.emit('interrupted'));
      room.on(ev.conference.CONNECTION_RESTORED, () => this.emit('joined'));
      try {
        for (const track of this.local.values()) await room.addTrack(track);
        if (!this.closed) room.join();
      } catch (error) { this.emit('error', error); }
    });
    conn.addEventListener(ev.connection.CONNECTION_FAILED, error => this.emit('error', error));
    conn.addEventListener(ev.connection.CONNECTION_DISCONNECTED, () => {
      if (!this.closed) this.emit('error', 'disconnected');
    });
    conn.connect();
  }
  async toggle(kind) {
    const track = this.local.get(kind);
    if (!track) return this.acquire(kind);
    if (track.isMuted()) await track.unmute(); else await track.mute();
    return track;
  }
  async end() {
    this.closed = true;
    // Release hardware before waiting for any network operations.
    await Promise.allSettled([...this.local.values()].map(track => track.dispose()));
    this.local.clear();
    try { await this.room?.leave(); } catch { /* Server may already be gone. */ }
    try { this.connection?.disconnect(); } catch { /* Already disconnected. */ }
  }
}
