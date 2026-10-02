import {track} from './sonavyr-measurement.js';
// Original supplied renders, unchanged. Matching durations are verified;
// level/alignment review was completed separately per the supplied handoff.
const clips = {
  mind: { dry: '/assets/media/sonavyr/mind-dry.wav', natural: '/assets/media/sonavyr/mind-natural.wav', synthetic: '/assets/media/sonavyr/mind-synthetic.wav' },
  rap: { dry: '/assets/media/sonavyr/rap-dry.m4a', synthetic: '/assets/media/sonavyr/rap-synthetic.m4a' }
};
const labels = { dry: 'Original', natural: 'Natural · Correction speed 30 ms', synthetic: 'Synthetic · Snap 0 ms' };
const audio = document.querySelector('#demo-audio');
const status = document.querySelector('#demo-status');
const selector = document.querySelector('#demo-clip');
let generation = 0;
let current = 'dry';
document.querySelectorAll('a[aria-disabled="true"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
function change(reset = false) {
  const token = ++generation;
  const time = reset ? 0 : audio.currentTime || 0;
  const playing = !audio.paused;
  audio.pause();
  const clip = clips[selector.value];
  const radios = [...document.querySelectorAll('[name="take"]')];
  radios.forEach(input => input.disabled = !clip[input.value]);
  if (!clip[current]) current = 'dry';
  radios.forEach(input => input.checked = input.value === current);
  audio.src = clip[current];
  status.textContent = `${labels[current]} selected. Loading…`;
  audio.onloadedmetadata = async () => {
    if (token !== generation) return;
    audio.currentTime = Math.min(time, Math.max(0, audio.duration - .01));
    status.textContent = `${labels[current]} selected. ${selector.value === 'rap' ? 'Natural is not supplied for this clip.' : 'All three versions available.'}`;
    if (playing) { try { await audio.play(); } catch { status.textContent += ' Press Play to continue.'; } }
  };
  audio.load();
}
document.querySelectorAll('[name="take"]').forEach(input => input.addEventListener('change', () => { current = input.value; change(); }));
selector.addEventListener('change', () => change(true));
audio.addEventListener('error', () => { status.textContent = 'Demo unavailable. Please select another version.'; });
change(true);

const measuredPlays=new Set();
audio.addEventListener("playing",()=>{const variant=`${selector.value}:${current}`;if(!measuredPlays.has(variant)){measuredPlays.add(variant);track("demo_play",variant);}});
