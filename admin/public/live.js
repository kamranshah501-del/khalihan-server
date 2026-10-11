// The panel's live side: a soft two-note chime and, when the tab is in the
// background, a computer notification — for each new sell request.

let audio = null;

/** Two short notes, quiet. Browsers allow sound only after a click on the
 *  page (logging in counts). */
export function chime() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const now = audio.currentTime;
    [[784, 0], [1046.5, 0.14]].forEach(([freq, at]) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.18, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.45);
      osc.connect(gain).connect(audio.destination);
      osc.start(now + at);
      osc.stop(now + at + 0.5);
    });
  } catch (_) { /* no sound on this browser */ }
}

export function desktopAllowed() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

export async function askDesktop() {
  if (typeof Notification === 'undefined') return 'unsupported';
  try { return await Notification.requestPermission(); } catch (_) { return 'denied'; }
}

export function desktopNotify(title, body) {
  if (!desktopAllowed() || !document.hidden) return;
  try {
    const n = new Notification(title, { body, tag: 'khalihan-request' });
    n.onclick = () => { window.focus(); n.close(); };
  } catch (_) { /* not allowed here */ }
}
