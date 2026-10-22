# Verification, 22 October 2026

- Static app: 23 browser checks passed, 4 physical-Safari media checks skipped. Chromium desktop and phone viewport exchanged real audio/video using synthetic capture and public VDO.Ninja infrastructure.
- Forced TURN calls passed in both Chromium configurations. Each actual remote DTLS certificate matched the other browser's local certificate. Audio arrived and video frames decoded in both directions.
- Modified ciphertext, wrong key, cross-room ciphertext and plaintext SDP were rejected in Chromium and WebKit. Unauthenticated descriptions never reached RTCPeerConnection.setRemoteDescription.
- First-run permission controls, denied-permission recovery, camera failure/audio-only continuation, restored grants, invitation fragments, RU/EN, mute/resume, remote departure and hardware cleanup passed.
- Native Android 15 emulator demo recorded the two browser permission prompts, quiet waiting screen, permission restoration after reload, live forced-relay call, microphone/camera toggles and hangup. No page JavaScript errors. Emulated camera and synthetic desktop media, not a staged UI.
- Portfolio regression checks: all 50 browser tests passed after adding /call/.

The four skipped checks require real Safari media capture. WebKit layout and crypto checks do not establish physical iPhone call compatibility. These checks are not an independent security audit or a load/uptime test.

## Public deployment

Published at https://sviatoslav-a.github.io/call/. Compared SHA-256 hashes of the served HTML, app, adapter, authentication module and SDK with the tested files; all matched.

The physical Pixel 8 then loaded the public site directly and exchanged generated audio/video with desktop Chromium in automatic and forced-TURN modes. Both modes passed certificate endpoint matching, camera toggle and hangup checks with no page errors. No ADB reverse proxy was used for these production calls. The Pixel reported a Polish public IP during this run, despite having reported a Russian IP in the earlier infrastructure probe. This is a Polish-network production check; the earlier Russian result is separate evidence. No new France call test was performed.

Chrome was closed on the Pixel after the test. The dedicated emulator and Jitsi VM were stopped after verification.
