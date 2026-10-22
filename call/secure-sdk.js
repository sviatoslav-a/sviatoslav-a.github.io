// Authenticated signalling for the pinned VDO.Ninja SDK. Wire-compatible routing,
// intentionally incompatible with stock clients that accept unauthenticated SDP.
const encoder = new TextEncoder();
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
const bytes = value => {
  if (typeof value !== 'string' || !/^(?:[0-9a-f]{2})+$/.test(value)) throw new Error('Invalid ciphertext');
  return Uint8Array.from(value.match(/../g), b => parseInt(b, 16));
};
export function privateSDK(secret, room, options = {}) {
  const Base = window.VDONinjaSDK;
  return new class extends Base {
    constructor() {
      super({ ...options, password: secret, salt: 'quiet-call-v1', debug: false });
      this.authorizedDescriptions = new Set();
      this.aad = encoder.encode('quiet-call-v1:' + room);
      this.key = crypto.subtle.importKey('raw', bytes(secret), 'AES-GCM', false, ['encrypt', 'decrypt']);
    }
    reject() {
      this.dispatchEvent(new CustomEvent('securityError'));
      throw new Error('Peer authentication failed');
    }
    async _encryptMessage(message) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: this.aad, tagLength: 128 }, await this.key, encoder.encode(message));
      return [hex(encrypted), hex(iv)];
    }
    async _decryptMessage(ciphertext, vector) {
      try {
        const iv = bytes(vector);
        if (iv.length !== 12) throw new Error('Invalid nonce');
        const result = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: this.aad, tagLength: 128 }, await this.key, bytes(ciphertext)));
        const parsed = JSON.parse(result);
        if (parsed.sdp && ['offer', 'answer'].includes(parsed.type)) {
          // Both WebSocket and data-channel SDP handlers converge on these guards.
          if (this.authorizedDescriptions.size > 256) this.authorizedDescriptions.clear();
          this.authorizedDescriptions.add(parsed.type + ':' + parsed.sdp);
        }
        return result;
      } catch { return this.reject(); }
    }
    verifyDescription(msg) {
      if (!this.authorizedDescriptions.has(msg.description?.type + ':' + msg.description?.sdp)) this.reject();
    }
    async _handleOfferSDP(msg) { this.verifyDescription(msg); return super._handleOfferSDP(msg); }
    async _handleAnswerSDP(msg) { this.verifyDescription(msg); return super._handleAnswerSDP(msg); }
  }();
}
