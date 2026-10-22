# VPS verification, 22 October 2026

The original Jitsi frontend remains a separate Docker application. It uses lib-jitsi-meet and official stable-11248 web, Prosody, Jicofo and Videobridge containers. No VDO.Ninja dependency was added.

## Latest checks

18 browser checks passed and 3 physical-Safari media checks were explicitly skipped. Desktop and mobile Chromium exchanged audio/video against the real Jitsi stack, using synthetic capture. Tests covered permission buttons, no unsolicited prompts, RU/EN, denied-permission recovery, audio-only continuation, permission restoration, mute/unmute, camera toggle, remote departure, local-track cleanup and room links. WebKit covered layout and permission denial, not hardware capture.

A new Android 15 ARM64 emulator demo recorded native Chrome permission prompts, the quiet waiting screen, a reload with restored grants, a live call, microphone and camera toggles, and hangup. The emulator supplied its emulated camera and desktop Chromium supplied a synthetic camera. No browser errors were reported. The H.264 recording has no audio track. See the separately supplied android-vps-demo.mp4.

The stack ran in the dedicated quiet-call-e2e Podman VM on macOS. The VM and emulator were stopped after testing. Docker Engine itself was not exercised. ADB reverse served the emulator's local HTTP/signalling; WebRTC transported real media. Public HTTPS, public DNS and VPS TURN deployment were not exercised in this release. No public VPS was provisioned.

## Privacy boundary

Jitsi transport encryption does not establish E2EE through Videobridge. The operator of the VPS is trusted and can access bridge media. This preserves the requested current VPS version. The separate Pages version authenticates signalling and uses browser-to-browser encrypted media through third-party TURN.

## Reproduce

Follow README.md to set up the containers, then run npm ci, npx playwright install chromium webkit, npm run check and npm test. No secrets or runtime directories are included in the source package.
