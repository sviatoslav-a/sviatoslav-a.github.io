# Quiet call

A minimal Russian/English calling interface built on **lib-jitsi-meet** and the official Jitsi server stack. No iframe, Jitsi meeting UI, login, display-name form, scheduling, or analytics.

## Experience

- Open `/` to create a random 144-bit room link. Send that URL to the other person.
- The browser's first preferred language selects Russian when it starts with `ru`; other languages use English.
- First visit: only **Microphone** and **Camera** buttons. Each asks for that permission separately, after a tap.
- Existing browser grants restore the devices without a prejoin screen. Stored consent is a fallback only when the browser cannot query permissions; it is never proof that permission is still granted.
- Once ready, the waiting canvas is empty except for a small self-view. Controls fade after 2.8 seconds; tap, move the pointer, or use the keyboard to reveal them.
- The other person's video fills the canvas. Audio-only calls remain possible after a camera failure.
- Hangup disposes local tracks before leaving the conference. Nothing is recorded.

## Local start

Requires Node.js 22+ for setup and Docker with Compose v2 for the server. The interface has no build step and no frontend package dependencies.

```sh
npm run setup
sh scripts/compose.sh up -d
```

Open `http://localhost:8088`. Localhost is a secure context for browser camera access. Plain HTTP on a LAN IP is not. Server secrets are generated in the ignored `.env` file; setup does not overwrite an existing file.

For LAN/mobile media, set `JVB_ADVERTISE_IPS` to the server's LAN IP and restart. For a public deployment use the public IPv4 address. `127.0.0.1` is only suitable for local desktop tests.

Calls prefer VP8 for compatibility with older Android browsers.

The containers are official Jitsi `stable-11248` images. `deploy/upstream/docker-compose.yml` is the unmodified configuration from that release. `deploy/quiet.yml` mounts this frontend over Jitsi's index and keeps the SDK, configuration, signalling and bridge endpoints from the same release.

## Public HTTPS deployment

Use a Linux server with Docker Compose, a domain pointing to it, and reachable TCP 80/443 and UDP 10000. A small personal deployment can start with 2 vCPU and 4 GB RAM; verify capacity for your workload.

1. Run `npm run setup` on the destination server. Do not copy the development `.env` or `.runtime` directories.
2. Edit `.env`:

```dotenv
PUBLIC_URL=https://call.example.com
CALL_DOMAIN=call.example.com
JVB_ADVERTISE_IPS=YOUR_PUBLIC_IPV4
```

3. Start with automatic HTTPS:

```sh
sh scripts/compose.sh --https up -d
```

Caddy obtains and renews the certificate and proxies WebSockets. Keep the internal HTTP port 8088 firewalled from the Internet. `PUBLIC_URL` must match the address guests open. Use the same `--https` option for stop/update commands on that deployment.

## TURN for restrictive networks

A Jitsi bridge does not guarantee connectivity from every mobile or corporate network. Configure a TURN relay before relying on this for public calls.

The upstream stack supports these `.env` settings for an existing Coturn deployment:

```dotenv
TURN_HOST=turn.example.com
TURN_PORT=3478
TURN_TRANSPORT=udp
TURNS_HOST=turn.example.com
TURNS_PORT=5349
TURN_CREDENTIALS=YOUR_COTURN_STATIC_AUTH_SECRET
```

Use the same secret as Coturn's `static-auth-secret`, with `use-auth-secret` enabled. Coturn needs its own DNS, TLS certificate for TURNS, and reachable relay port range. For networks allowing only TCP 443, deploy TURN/TLS on 443 on a separate IP or server; Caddy already uses this port on the meeting server. Restart the stack after changing settings. This package does not provision a public TURN server or certificate on your behalf.

Test TURN by blocking direct UDP on a test client and inspecting the selected ICE candidate pair. Local successful calls do not prove TURN fallback or cellular-network connectivity.

## Tests

```sh
npm ci
npx playwright install chromium webkit
npm run check
npm test
```

The backend must be running at `http://localhost:8088`, or supply `BASE_URL`.

Chromium tests use synthetic audio/video capture devices but real Jitsi signalling and WebRTC media. They verify incoming audio bytes and decoded video frames in both directions, mute/unmute, camera toggle, remote departure, hardware-track cleanup, permission restoration, permission denial, and audio-only recovery. Mobile Chromium uses touch and a phone viewport. WebKit tests cover iPhone layout, language and denied-permission recovery, not physical iPhone capture or Safari's native permission dialog.

See `VERIFICATION.md` for the checks actually completed in this build. Test hooks live in Playwright init scripts, never the shipped application. `npm run dev` optionally serves local frontend edits on port 4173 and proxies SDK/signalling requests to `JITSI_ORIGIN`, default `http://localhost:8088`.

## Files and license

- `public/`: custom interface, localization, permission handling, and Jitsi adapter.
- `deploy/`: pinned upstream Compose, frontend mount, optional Caddy HTTPS.
- `scripts/setup.mjs`: local secrets and runtime-directory creation.
- `tests/`: reproducible browser tests.

The custom code is licensed under Apache-2.0. Jitsi's license is included in `deploy/upstream/LICENSE`; the actual SDK comes from the Jitsi image, preserving its notices. `NOTICE` records provenance. No hosted service or third-party Jitsi instance is required.

This configuration permits anonymous meetings. Possession of a room link grants access; forward links only to intended participants. Rooms are not limited to two users, and there is no identity verification. Jitsi transport encryption is not a claim of end-to-end encryption through a media bridge; this frontend does not add Jitsi's optional E2EE mode.
