import { mkdir, writeFile, access, chmod } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
try { await access(envPath); console.log('.env already exists. Edit it to change your server settings.'); process.exit(0); } catch {}
const publicUrl = process.env.PUBLIC_URL || 'http://localhost:8088';
const ip = process.env.JVB_ADVERTISE_IPS || '127.0.0.1';
for (const value of [root, publicUrl, ip]) if (/[\r\n]/.test(value)) throw new Error('Invalid configuration');
const runtime = path.join(root, '.runtime');
for (const directory of ['web', 'prosody/config', 'prosody/prosody-plugins-custom', 'jicofo', 'jvb', 'storage/web', 'storage/prosody', 'storage/transcripts', 'tmp/web-load-test']) {
  const target = path.join(runtime, directory); await mkdir(target, { recursive: true });
  // Rootless official images run as UID 1000. These are local container state directories.
  await chmod(target, 0o777);
}
const secret = () => randomBytes(32).toString('hex');
const env = {
  COMPOSE_PROJECT_NAME: 'quiet-call', APP_DIR: root, CONFIG: runtime,
  JITSI_IMAGE_REPO: 'ghcr.io/jitsi', JITSI_IMAGE_VERSION: 'stable-11248',
  HTTP_PORT: '8088', HTTPS_PORT: '8448', JVB_PORT: '10000', JVB_COLIBRI_PORT: '18080', JICOFO_REST_PORT: '18888',
  PUBLIC_URL: publicUrl, JVB_ADVERTISE_IPS: ip, TZ: 'UTC',
  ENABLE_AUTH: '0', ENABLE_GUESTS: '0', ENABLE_LETSENCRYPT: '0', ENABLE_HTTP_REDIRECT: '0',
  DISABLE_HTTPS: '1', ENABLE_XMPP_WEBSOCKET: '1', ENABLE_COLIBRI_WEBSOCKET: '1', ENABLE_P2P: '1',
  JICOFO_AUTH_PASSWORD: secret(), JVB_AUTH_PASSWORD: secret(), JIGASI_XMPP_PASSWORD: secret(), JIBRI_XMPP_PASSWORD: secret(), JIBRI_RECORDER_PASSWORD: secret(),
  ENABLE_RECORDING: '0', ENABLE_TRANSCRIPTIONS: '0', ENABLE_LIVESTREAMING: '0',
  DISABLE_DEEP_LINKING: '1', ENABLE_PREJOIN_PAGE: '0', ENABLE_WELCOME_PAGE: '0',
  ENABLE_REQUIRE_DISPLAY_NAME: '0', ENABLE_THIRD_PARTY_REQUESTS: '0', ENABLE_STATS_ID: '0', RTCSTATS_ENABLED: '0',
  XMPP_DOMAIN: 'meet.jitsi', XMPP_AUTH_DOMAIN: 'auth.meet.jitsi', XMPP_MUC_DOMAIN: 'muc.meet.jitsi',
  XMPP_INTERNAL_MUC_DOMAIN: 'internal-muc.meet.jitsi', XMPP_SERVER: 'xmpp.meet.jitsi'
};
await writeFile(envPath, Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 });
console.log(`Created .env and container state directories. Public URL: ${publicUrl}`);
