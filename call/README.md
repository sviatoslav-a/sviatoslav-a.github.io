# Quiet call for GitHub Pages

A static RU/EN calling app with the same minimal interface as the separate Jitsi VPS version. Open the app, send the generated link, and allow microphone and camera. There is no account or name form. Language follows the browser's first preferred language. Previously granted permissions restore automatically.

## Run and deploy

Serve `public/` over HTTPS. Local development can use `python3 -m http.server 4187 --directory public` and `http://localhost:4187/`. GitHub Pages can serve these files under any directory without rewrites. The deployed copy lives at `/call/`; the existing portfolio stays at `/`.

No VDO.Ninja account, API key, room provisioning, or owned backend is required. The official SDK connects to public VDO.Ninja signalling and obtains shared TURN configuration. This is a shared community service, with no uptime guarantee. Maintain the pinned SDK and this adapter when upstream changes.

Add `?relay=1` before the invitation fragment to require TURN instead of a direct connection. This can hide a participant's network address from the other participant, but not from the relay operator.

## Privacy

Every new invitation contains an independent 144-bit room ID and 256-bit random secret in the URL fragment. The fragment is not part of the HTTP request to GitHub. Anyone holding the full invitation can join. This authenticates possession of the link, not a person's identity. Share it over a trusted channel.

`secure-sdk.js` subclasses the pinned official SDK. It replaces its AES-CBC message encryption with Web Crypto AES-256-GCM, a fresh 96-bit nonce, a 128-bit authentication tag, and room-specific authenticated data. Both offer and answer handlers reject descriptions that were not successfully authenticated. SDP contains the DTLS certificate fingerprint, binding media encryption to a participant holding the invitation secret. Altered messages, wrong secrets, cross-room ciphertext and plaintext SDP are rejected. Stock VDO.Ninja viewers cannot join these calls.

Audio/video uses browser DTLS-SRTP between participants, including when packets traverse TURN. No SFU or Meshcast mode is used. Tests compare actual DTLS endpoint certificates across both browsers. No recording, analytics or runtime third-party JavaScript is included; the SDK is served from this deployment. A restrictive Content Security Policy limits scripts and network destinations.

The hosting account, delivered JavaScript, browser and participant devices remain trusted. The signalling and TURN providers still see connection metadata and can deny service. Direct peers can see each other's network address. This implementation has targeted security tests, not an independent cryptographic audit. Do not reuse invitation links for unrelated calls.

## Verification

`npm ci`, then `npx playwright install chromium webkit`, then `npm test` while the static server runs on port 4187. Use `BASE_URL` to change the test server origin. Tests include desktop and mobile Chromium media, forced TURN, certificate matching, mute/resume, hangup and hardware-track cleanup, permission restore/denial, camera failure, RU/EN, and authenticated-signalling rejection. WebKit covers layout, language, denial, invitations and cryptography. Actual Safari camera/microphone calls need a physical iPhone and are not claimed as tested.

The Android demo uses native Chrome permission dialogs and real WebRTC on an Android 15 emulator with emulated cameras. See `VERIFICATION.md` for completed runs.

## Licensing

Custom interface and adapter: Apache-2.0, see `LICENSE`.

Vendored VDO.Ninja SDK 1.6.2: MPL-2.0, see `public/vendor/LICENSE`. Source: https://sdk.vdo.ninja/vdoninja-sdk.js and https://github.com/steveseguin/ninjasdk. The SDK is unmodified, with SHA-256 `cd295ad295713ca14b6c4cded2380ccd2e663952abd33bc43a76a4986a59e5ee`. Authentication changes are in the separate `secure-sdk.js` subclass. All source is distributed with the app.

## Camera switching and participant visibility

On devices with multiple cameras, a switch-camera button appears in the call controls. It cycles camera devices, keeps mute state, and mirrors only the front-camera preview. The previous camera is released before the next one opens; if capture fails, the app tries to restore the original camera.

Authenticated receive-only connections now create a visible participant placeholder even when they send no audio or video. Possession of the full invitation still grants access: there is no identity check, waiting room, two-person limit, or protection from a participant recording the call.
