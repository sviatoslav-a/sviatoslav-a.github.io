# Verification — 22 October 2026

## Shipped app

Custom Russian/English frontend using lib-jitsi-meet from official Jitsi stable-11248 containers. Anonymous rooms, separate user-triggered microphone/camera requests, automatic entry when permission is already granted, small self-view, and controls that fade when idle. VP8 is preferred for compatibility with older Android Chrome.

## Checks completed

| Check | Result |
| --- | --- |
| JavaScript syntax | Passed |
| Desktop Chromium | 7/7 passed |
| Mobile Chromium, Pixel viewport and touch | 7/7 passed |
| WebKit, iPhone viewport | 4/4 layout, language, denial, and room-link tests passed |
| WebKit capture tests | 3 explicitly skipped; not a physical iPhone test |
| Physical Pixel 8, Chrome 155 | Native microphone and camera prompts accepted; Russian UI; automatic permission restoration; audio/video received both ways; mute, camera toggle, and hangup passed |
| Android 15 ARM64 emulator, Chrome 124 | Native site and Android app permission prompts accepted; English UI; automatic permission restoration; audio/video received both ways; mute, camera toggle, and hangup passed |
| Native emulator recording | Completed; H.264, 720 × 1280, approximately 61 seconds; no browser errors |

The final automated suite completed with **18 passed, 3 skipped, 0 failed** in approximately 28 seconds. It used the actual local Jitsi services. Chromium's test capture devices supplied synthetic media; signalling and WebRTC transport were real. Denial and missing-camera tests deliberately injected those browser errors.

The physical Pixel test was completed before the final VP8 compatibility preference was added. The user then requested that the phone window be closed; its two test tabs were closed and the device returned to its home screen. The final codec configuration was retested on the emulator and across the browser suite.

## Media evidence

These are snapshots of inbound WebRTC statistics, not network-speed benchmarks:

| Device | Incoming audio bytes | Incoming video bytes | Decoded video frames |
| --- | ---: | ---: | ---: |
| Pixel 8 | 4,803 | 18,697 | 34 |
| Pixel's desktop peer | 5,326 | 47,829 | 79 |
| Android emulator | 6,951 | 98,864 | 47 |
| Emulator's desktop peer | 5,280 | 71,671 | 42 |

Remote video had a nonzero displayed width on both ends. The successful mobile runs recorded no page errors. Raw summaries are in `verification/`.

## Demo

`android-demo.mp4` is a native `adb screenrecord` capture from the local emulator, provided beside the source archive. It shows the two-button entry, real Chrome permission prompts, the empty waiting screen with self-view, a reload that restores permissions, a second participant joining, microphone/camera controls, and hangup. The emulator camera is the Android test animation; the desktop peer uses Chromium's synthetic camera. The screen recording has no audio track.

## Environment and limits

- The official Docker Compose stack ran under Podman 5.8.2 on macOS ARM64 in a dedicated test VM. Docker Engine itself was not installed or exercised here.
- Jitsi web, Prosody, Jicofo, and Videobridge were real local containers. Test devices used ADB reverse for localhost HTTP and signalling, with real WebRTC media over local networking. Both P2P and bridge connections could exist; relay-only operation was not forced.
- Public DNS, public HTTPS issuance, cellular networks, restrictive firewalls, and TURN fallback were not exercised. Deployment instructions cover HTTPS and external TURN configuration.
- No physical iPhone was available. The iPhone-shaped WebKit checks are not proof of Safari camera/audio behavior on hardware.
- The recording proves the local flow, not Internet deployment readiness or load capacity.

## Reproduce

Follow `README.md` to start the containers, then run `npm ci`, `npx playwright install chromium webkit`, `npm run check`, and `npm test`. Test artifacts default to `test-results/`; `TEST_OUTPUT` and `TEST_REPORT` can override their locations.

For an Android device connected through ADB, use `adb -s DEVICE reverse tcp:8088 tcp:8088`, open a fresh room at `http://localhost:8088/`, and open its same room link in a desktop browser. Set `JVB_ADVERTISE_IPS` to the host's reachable LAN IP. Accept the native prompts on Android, check media in both directions, toggle the devices, and hang up. Remove the ADB reverse mapping afterward. Public phone testing needs HTTPS and reachable media ports instead.


## Separate VPS release, 22 October 2026

Re-ran the original Jitsi version against its isolated Podman-hosted Jitsi stack. 18 checks passed and 3 physical-Safari media checks were skipped. This remains an independent Docker deployment and does not contact VDO.Ninja. Transport encryption is not E2EE through Jitsi Videobridge; the operator of this VPS is trusted.
