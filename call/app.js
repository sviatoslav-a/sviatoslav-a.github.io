import { VdoCall, invitation } from './vdo.js?v=20261023-camera';

const $ = id => document.getElementById(id);
const locale = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
const strings = {
  en: {
    title: 'Call', permissions: 'Camera and microphone', participants: 'Participants',
    audio: 'Microphone', video: 'Camera', audioOn: 'Microphone on', videoOn: 'Camera on',
    allow: 'Choose Allow in your browser.', deniedAudio: 'Microphone blocked. Allow it in the site settings next to the address, then try again.',
    deniedVideo: 'Camera blocked. Allow it in the site settings next to the address, then try again.',
    missingAudio: 'No microphone found. Connect one and try again.', missingVideo: 'No camera found. Connect one and try again.',
    busyAudio: 'Microphone is in use. Close the other app and try again.', busyVideo: 'Camera is in use. Close the other app and try again.',
    failed: 'Could not turn it on. Try again.', skipVideo: 'Continue without camera', skipAudio: 'Continue without microphone',
    mute: 'Turn microphone off', unmute: 'Turn microphone on', cameraOff: 'Turn camera off', cameraOn: 'Turn camera on', switchCamera: 'Switch camera',
    end: 'End call', share: 'Copy call link', copied: 'Link copied', retry: 'Try again',
    connecting: 'Connecting…', disconnected: 'Connection lost.', server: 'Cannot connect to the call.',
    play: 'Tap to hear the call', rejoin: 'Call again', link: 'Call link', copy: 'Copy link', close: 'Close',
    secure: 'Open this link with HTTPS to use your camera and microphone.', stopped: 'Camera or microphone disconnected.'
  },
  ru: {
    title: 'Звонок', permissions: 'Камера и микрофон', participants: 'Участники',
    audio: 'Микрофон', video: 'Камера', audioOn: 'Микрофон включён', videoOn: 'Камера включена',
    allow: 'Нажмите «Разрешить» в окне браузера.', deniedAudio: 'Микрофон заблокирован. Разрешите доступ в настройках сайта рядом с адресом и попробуйте снова.',
    deniedVideo: 'Камера заблокирована. Разрешите доступ в настройках сайта рядом с адресом и попробуйте снова.',
    missingAudio: 'Микрофон не найден. Подключите его и попробуйте снова.', missingVideo: 'Камера не найдена. Подключите её и попробуйте снова.',
    busyAudio: 'Микрофон занят. Закройте другое приложение и попробуйте снова.', busyVideo: 'Камера занята. Закройте другое приложение и попробуйте снова.',
    failed: 'Не удалось включить. Попробуйте снова.', skipVideo: 'Продолжить без камеры', skipAudio: 'Продолжить без микрофона',
    mute: 'Выключить микрофон', unmute: 'Включить микрофон', cameraOff: 'Выключить камеру', cameraOn: 'Включить камеру', switchCamera: 'Сменить камеру',
    end: 'Завершить звонок', share: 'Скопировать ссылку', copied: 'Ссылка скопирована', retry: 'Повторить',
    connecting: 'Подключение…', disconnected: 'Связь прервалась.', server: 'Не удалось подключиться к звонку.',
    play: 'Нажмите, чтобы включить звук', rejoin: 'Позвонить снова', link: 'Ссылка на звонок', copy: 'Скопировать', close: 'Закрыть',
    secure: 'Откройте ссылку через HTTPS, чтобы включить камеру и микрофон.', stopped: 'Камера или микрофон отключены.'
  }
};
const t = strings[locale];
document.documentElement.lang = locale;
document.title = t.title;
$('stage').setAttribute('aria-label', t.title);
$('permissions').setAttribute('aria-label', t.permissions);
$('remote-grid').setAttribute('aria-label', t.participants);
const paths = {
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
  'mic-off': '<path d="m3 3 18 18M9 9v3a3 3 0 0 0 5 2M9 5a3 3 0 0 1 6 0v6M5 10v2a7 7 0 0 0 12 5m2-5v-2M12 19v3m-4 0h8"/>',
  camera: '<rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 9 6-4v14l-6-4"/>',
  'camera-off': '<path d="m3 3 18 18M15 9l6-4v11M10 5h2a3 3 0 0 1 3 3v2M4 6a3 3 0 0 0-1 2v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3"/>',
  'switch-camera': '<path d="M4 8a9 9 0 0 1 15-2l2 2M21 3v5h-5M20 16a9 9 0 0 1-15 2l-2-2M3 21v-5h5"/>',
  hangup: '<path d="M3 15v-4c5-5 13-5 18 0v4l-5-1v-3a12 12 0 0 0-8 0v3z"/>',
  link: '<path d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
  check: '<path d="m5 12 4 4L19 6"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
for (const el of document.querySelectorAll('[data-icon]')) el.innerHTML = icon(el.dataset.icon);
const label = (el, text) => { el.setAttribute('aria-label', text); el.title = text; };
for (const kind of ['audio', 'video']) $('allow-' + kind).querySelector('.permission-label').textContent = t[kind];
label($('switch-camera'), t.switchCamera);
label($('share'), t.share); label($('hangup'), t.end); label($('close-share'), t.close);
$('play').textContent = t.play; $('rejoin').textContent = t.rejoin; $('retry').textContent = t.retry;
$('link-label').textContent = t.link; $('copy-link').textContent = t.copy;

const invite = invitation();
const call = new VdoCall(invite);
const state = { audio: 'idle', video: 'idle', ready: false, ended: false };
let noticeTimer, idleTimer, connectionTimer;
const saved = {
  get(key) { try { return localStorage.getItem('quiet.' + key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem('quiet.' + key, value); } catch { /* Private mode. */ } }
};
function notice(message, retry = false, temporary = false) {
  clearTimeout(noticeTimer);
  $('notice-text').textContent = message;
  $('notice').hidden = !message;
  $('retry').hidden = !retry;
  if (temporary) noticeTimer = setTimeout(() => notice(''), 2200);
}
function showControls() {
  if (!state.ready || state.ended) return;
  document.body.classList.remove('quiet');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!$('call-chrome').contains(document.activeElement)) document.body.classList.add('quiet');
  }, 2800);
}
function updateControls() {
  $('self-video').style.transform = call.cameraFacing === 'environment' ? 'none' : 'scaleX(-1)';
  for (const kind of ['audio', 'video']) {
    const track = call.local.get(kind);
    const on = !!track && !track.isMuted();
    const button = $('toggle-' + kind);
    button.innerHTML = icon(kind === 'audio' ? (on ? 'mic' : 'mic-off') : (on ? 'camera' : 'camera-off'));
    button.setAttribute('aria-pressed', String(on));
    label(button, kind === 'audio' ? (on ? t.mute : t.unmute) : (on ? t.cameraOff : t.cameraOn));
    if (kind === 'audio') $('self-muted').hidden = on;
    else { $('self-off').hidden = on; $('self-video').hidden = !on; }
  }
}
function permissionError(error, kind) {
  const text = `${error?.name} ${error?.message} ${error?.gum?.error?.name} ${error?.gum?.error?.message}`.toLowerCase();
  const suffix = kind === 'audio' ? 'Audio' : 'Video';
  if (/denied|notallowed|permission|security/.test(text)) return t['denied' + suffix];
  if (/notfound|not_found|device.*found/.test(text)) return t['missing' + suffix];
  if (/notreadable|trackstarterror|busy|not_readable/.test(text)) return t['busy' + suffix];
  if (text.includes('server')) return t.server;
  return t.failed;
}
async function request(kind, automatic = false) {
  if (state[kind] === 'busy' || state[kind] === 'on' || state.ended) return;
  const button = $('allow-' + kind);
  state[kind] = 'busy'; button.dataset.state = 'busy'; button.disabled = true;
  if (!automatic) $('permission-help').textContent = t.allow;
  try {
    const track = await call.acquire(kind);
    if (!track || state.ended) return;
    saved.set(kind, 'allowed');
    state[kind] = 'on'; button.dataset.state = 'on';
    button.querySelector('.permission-check').innerHTML = icon('check');
    label(button, t[kind + 'On']);
    if (kind === 'video') { track.attach($('self-video')); $('self').hidden = false; }
    if (state.audio !== 'busy' && state.video !== 'busy') $('permission-help').textContent = '';
    updateControls();
    if (kind === 'video') updateCameraSwitch();
    if (['on', 'skipped'].includes(state.audio) && ['on', 'skipped'].includes(state.video)) await ready();
    else if (state.audio === 'error' || state.video === 'error') offerSkip();
  } catch (error) {
    saved.set(kind, 'blocked');
    state[kind] = 'error'; button.dataset.state = 'error'; button.disabled = false;
    $('permission-help').textContent = permissionError(error, kind);
    offerSkip();
  }
}
function offerSkip() {
  const kind = state.audio === 'on' && state.video === 'error' ? 'video' : state.video === 'on' && state.audio === 'error' ? 'audio' : null;
  $('skip').hidden = !kind;
  if (kind) {
    $('skip').textContent = kind === 'video' ? t.skipVideo : t.skipAudio;
    $('skip').onclick = () => { state[kind] = 'skipped'; ready(); };
  }
}
async function ready() {
  if (state.ready) return;
  state.ready = true;
  $('permissions').hidden = true; $('call-chrome').hidden = false;
  $('self').hidden = !call.local.has('video');
  document.activeElement?.blur();
  updateControls(); showControls();
  notice(t.connecting);
  connectionTimer = setTimeout(() => notice(t.server, true), 20000);
  try { await call.connect(); } catch { clearTimeout(connectionTimer); notice(t.server, true); }
}
const participants = new Map();
function participant(id) {
  if (participants.has(id)) return participants.get(id);
  const el = document.createElement('div'); el.className = 'participant'; el.dataset.muted = 'true';
  const placeholder = document.createElement('span'); placeholder.className = 'participant-placeholder'; placeholder.innerHTML = icon('person');
  el.append(placeholder); $('remote-grid').append(el); participants.set(id, el);
  $('remote-grid').style.setProperty('--columns', participants.size > 1 ? '2' : '1');
  return el;
}
function attemptPlay(media) {
  const result = media.play();
  result?.catch(() => { $('play').hidden = false; });
}
call.addEventListener('present', ({ detail: id }) => participant(id));
call.addEventListener('remote', ({ detail: track }) => {
  const el = participant(track.getParticipantId());
  const media = document.createElement(track.getType());
  media.autoplay = true; media.setAttribute('playsinline', ''); media.dataset.track = track.getId();
  if (track.getType() === 'video') media.muted = true;
  el.append(media); track.attach(media);
  if (track.getType() === 'video') {
    const refresh = () => { el.dataset.muted = String(track.isMuted()); };
    track.on(call.sdk.events.track.TRACK_MUTE_CHANGED, refresh); refresh();
  }
  attemptPlay(media);
});
call.addEventListener('removed', ({ detail: track }) => {
  const el = participants.get(track.getParticipantId());
  if (!el) return;
  for (const media of el.querySelectorAll('audio,video')) {
    if (media.dataset.track === track.getId()) { track.detach(media); media.remove(); }
  }
  if (track.getType() === 'video') el.dataset.muted = 'true';
});
call.addEventListener('left', ({ detail: id }) => { participants.get(id)?.remove(); participants.delete(id); $('remote-grid').style.setProperty('--columns', participants.size > 1 ? '2' : '1'); });
call.addEventListener('joined', () => { clearTimeout(connectionTimer); notice(''); document.body.dataset.connected = 'true'; });
call.addEventListener('error', () => { clearTimeout(connectionTimer); if (!state.ended) { notice(t.server, true); document.body.dataset.connected = 'false'; } });
call.addEventListener('interrupted', () => { notice(t.disconnected, true); document.body.dataset.connected = 'false'; });
call.addEventListener('stopped', () => { if (!state.ended) { updateControls(); notice(t.stopped, true); } });
for (const kind of ['audio', 'video']) {
  $('allow-' + kind).onclick = () => request(kind);
  $('toggle-' + kind).onclick = async () => {
    const button = $('toggle-' + kind); button.disabled = true;
    try {
      const track = await call.toggle(kind);
      if (kind === 'video' && track) { track.attach($('self-video')); $('self').hidden = false; updateCameraSwitch(); }
      updateControls();
    } catch (error) { notice(permissionError(error, kind), false); }
    finally { button.disabled = false; showControls(); }
  };
}
async function updateCameraSwitch() {
  $('switch-camera').hidden = !(await call.canSwitchCamera());
}
$('switch-camera').onclick = async () => {
  const button = $('switch-camera'); button.disabled = true;
  $('toggle-video').disabled = true;
  try {
    const track = await call.switchCamera();
    if (track) { track.attach($('self-video')); updateControls(); }
  } catch (error) {
    const restored = call.local.get('video');
    if (restored) restored.attach($('self-video'));
    updateControls(); notice(permissionError(error, 'video'));
  } finally {
    button.disabled = false; $('toggle-video').disabled = false; showControls();
  }
};
navigator.mediaDevices?.addEventListener('devicechange', updateCameraSwitch);
$('play').onclick = async () => {
  const results = await Promise.allSettled([...document.querySelectorAll('#remote-grid audio, #remote-grid video')].map(el => el.play()));
  $('play').hidden = results.every(result => result.status === 'fulfilled');
};
$('hangup').onclick = async () => {
  state.ended = true; clearTimeout(connectionTimer); clearTimeout(idleTimer); notice('');
  $('self').hidden = true; $('call-chrome').hidden = true; $('ended').hidden = false; $('play').hidden = true;
  $('remote-grid').replaceChildren(); document.body.dataset.connected = 'false';
  await call.end();
};
$('rejoin').onclick = () => location.reload();
$('retry').onclick = () => location.reload();
const callLink = () => location.href;
$('share').onclick = async () => {
  try { await navigator.clipboard.writeText(callLink()); notice(t.copied, false, true); }
  catch { $('room-link').value = callLink(); $('share-dialog').showModal(); $('room-link').select(); }
};
$('copy-link').onclick = async () => {
  try { await navigator.clipboard.writeText(callLink()); $('share-dialog').close(); notice(t.copied, false, true); }
  catch { $('room-link').select(); }
};
window.addEventListener('pointermove', showControls, { passive: true });
window.addEventListener('pointerdown', showControls, { passive: true });
window.addEventListener('keydown', showControls);
window.addEventListener('hashchange', () => location.reload());
window.addEventListener('pagehide', () => { state.ended = true; call.end(); });
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });

// Query real browser permission state. Remembered consent is only a fallback for
// browsers that do not implement camera/microphone permission queries.
async function restore() {
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    $('permission-help').textContent = t.secure;
    for (const kind of ['audio', 'video']) $('allow-' + kind).disabled = true;
    return;
  }
  for (const kind of ['audio', 'video']) {
    let allowed = false;
    try {
      const permission = await navigator.permissions.query({ name: kind === 'audio' ? 'microphone' : 'camera' });
      allowed = permission.state === 'granted';
    } catch { allowed = saved.get(kind) === 'allowed'; }
    if (allowed) await request(kind, true);
  }
}
// Restore only after the SDK and document are ready.
if (document.readyState === 'complete') restore(); else window.addEventListener('load', restore, { once: true });
