# Verification, 22 October 2026

- Static app: 23 browser checks passed, 4 physical-Safari media checks skipped. Chromium desktop and phone viewport exchanged real audio/video using synthetic capture and public VDO.Ninja infrastructure.
- Forced TURN calls passed in both Chromium configurations. Each actual remote DTLS certificate matched the other browser's local certificate. Audio arrived and video frames decoded in both directions.
- Modified ciphertext, wrong key, cross-room ciphertext and plaintext SDP were rejected in Chromium and WebKit. Unauthenticated descriptions never reached RTCPeerConnection.setRemoteDescription.
- First-run permission controls, denied-permission recovery, camera failure/audio-only continuation, restored grants, invitation fragments, RU/EN, mute/resume, remote departure and hardware cleanup passed.
- Native Android 15 emulator demo recorded the two browser permission prompts, quiet waiting screen, permission restoration after reload, live forced-relay call, microphone/camera toggles and hangup. No page JavaScript errors. Emulated camera and synthetic desktop media, not a staged UI.
- Portfolio regression checks: all 50 browser tests passed after adding /call/.

The four skipped checks require real Safari media capture. WebKit layout and crypto checks do not establish physical iPhone call compatibility. These checks are not an independent security audit or a load/uptime test.
