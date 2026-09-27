/* The level meters on the product mocks.

   They used to be one CSS keyframe loop shared by every bar on the page: the
   same 3.2 s curve on every card, input identical to output, rising as slowly
   as it fell. A row of cards therefore swung in lockstep, which is the one
   thing a real meter never does.

   What this does instead, per card:
     - a source that behaves like programme material: hits on a beat (or, on
       the De-Esser, syllables), a body level between them, a phrase level
       that drifts, now and then a quieter passage. Every card gets its own
       tempo and its own random sequence, so no two cards move together;
     - L and R that share that source but differ by a decibel or so, the way
       a stereo mix does;
     - peak-meter ballistics: a fast rise and a slow, steady fall of about
       20 dB in 1.7 s (the IEC 60268-10 Type I programme meter);
     - input, output and gain reduction that follow from one another the way
       the product's own processing would at the values its rail shows, not
       three unrelated loops. Inflator's rail reads Amount 0 %, so its output
       is its input.

   Without this file, and for anyone who asked for reduced motion, the bars
   hold the still frame the stylesheet gives them.

   Served from this origin as a classic script, like the rest of the site's:
   the CSP has no 'unsafe-inline'. */
(function () {
  'use strict';

  var mocks = document.querySelectorAll('.mock');
  if (mocks.length === 0) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var FLOOR_DB = -42;          // left edge of a level bar
  var FALL_DB_PER_S = 20 / 1.7; // IEC 60268-10 Type I return
  var ATTACK_S = 0.01;

  /* Every card starts from its own seed, so two cards are never in step. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function levelScale(db) {
    return Math.max(0.02, Math.min(1, (db - FLOOR_DB) / -FLOOR_DB));
  }

  /* Programme-like source, in dBFS. `hot` shifts the whole thing, for the
     product that sits last in a chain; `vocal` swaps the beat for syllables. */
  function makeSource(rand, hot, vocal) {
    var bpm = 84 + rand() * 44;
    var step = vocal ? 0.16 + rand() * 0.1 : 60 / bpm / 2; // eighth notes
    var t = rand() * step;
    var n = Math.floor(rand() * 16);
    var phrase = -12 + hot + (rand() * 4 - 2);
    var phraseTarget = phrase;
    var breakdown = 0;
    var hit = FLOOR_DB;
    return function (dt) {
      t -= dt;
      if (t <= 0) {
        t += vocal ? 0.12 + rand() * 0.22 : step;
        n = (n + 1) % 16;
        var accent;
        if (vocal) {
          accent = rand() < 0.18 ? -30 : -2 + rand() * 4; // gaps between words
        } else {
          accent = n % 4 === 0 ? 2.5 : n % 4 === 2 ? 1 : -5 + rand() * 2;
        }
        hit = phrase + breakdown + accent + (rand() * 2 - 1);
        if (rand() < 0.08) phraseTarget = -12 + hot + (rand() * 6 - 3);
        if (breakdown === 0 && rand() < 0.012) breakdown = -7;
        else if (breakdown !== 0 && rand() < 0.06) breakdown = 0;
      }
      phrase += (phraseTarget - phrase) * Math.min(1, dt / 1.5);
      // between hits the level settles towards the body of the mix
      var body = phrase + breakdown - (vocal ? 14 : 7);
      hit += (body - hit) * Math.min(1, dt / (vocal ? 0.09 : 0.14));
      return hit;
    };
  }

  /* A peak meter: rises almost at once, falls at a fixed rate. */
  function peakMeter() {
    var shown = FLOOR_DB;
    return function (db, dt) {
      if (db > shown) shown += (db - shown) * Math.min(1, dt / ATTACK_S);
      else shown = Math.max(db, shown - FALL_DB_PER_S * dt);
      return shown;
    };
  }

  /* A gain computer's own smoothing: attack and release in seconds. */
  function follower(attack, release) {
    var v = 0;
    return function (target, dt) {
      var tau = target > v ? attack : release;
      v += (target - v) * Math.min(1, dt / tau);
      return v;
    };
  }

  /* One stereo offset that wanders slowly, so L and R are the same mix but
     never the same line. */
  function stereoDrift(rand) {
    var v = rand() * 2 - 1;
    var target = v;
    return function (dt) {
      if (rand() < dt * 0.8) target = rand() * 2.4 - 1.2;
      v += (target - v) * Math.min(1, dt / 0.6);
      return v;
    };
  }

  /* How each product turns its input into output and gain reduction, at the
     settings its rail shows. Returns [outDb, grDb]. */
  var PROCESS = {
    Compressor: function () {
      // Glue, Compression 0.56: gentle ratio, slow release, a little make-up
      var gr = follower(0.03, 0.3);
      return function (inDb, dt) {
        var over = Math.max(0, inDb + 20);
        var g = gr(over * 0.5, dt);
        return [inDb - g + 3, g];
      };
    },
    Maximizer: function () {
      // Input Gain 0 dB, Ceiling -0.3 dBTP: only the hottest peaks are held
      var gr = follower(0.002, 0.12);
      return function (inDb, dt) {
        var g = gr(Math.max(0, inDb + 0.3), dt);
        return [Math.min(inDb - g, -0.3), g];
      };
    },
    'De-Esser': function (rand) {
      // Control, 100 %: reduction only on sibilant bursts, not on every hit
      var burst = 0;
      var gr = follower(0.005, 0.08);
      return function (inDb, dt) {
        if (burst > 0) burst -= dt;
        else if (inDb > -20 && rand() < dt * 1.4) burst = 0.06 + rand() * 0.1;
        var g = gr(burst > 0 ? 3 + rand() * 4 : 0, dt);
        return [inDb - g * 0.5, g];
      };
    },
    Inflator: function () {
      // Amount 0 %: the stage passes the signal unchanged
      return function (inDb) {
        return [inDb, 0];
      };
    },
    MixRack: function () {
      return function (inDb) {
        return [inDb, 0];
      };
    }
  };
  var GR_FULL_SCALE = { Compressor: 12, Maximizer: 6, 'De-Esser': 10 };
  var HOT = { Maximizer: 7 };

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  var cards = [];
  Array.prototype.forEach.call(mocks, function (mock) {
    var title = mock.querySelector('.mock-title');
    var name = title ? title.textContent.trim() : '';
    if (!PROCESS[name]) return;
    var groups = mock.querySelectorAll('.meters');
    if (groups.length === 0) return;

    var rand = rng(hash(name) ^ Math.floor(Math.random() * 4294967296));
    var card = {
      mock: mock,
      visible: true,
      source: makeSource(rand, HOT[name] || 0, name === 'De-Esser'),
      drift: [stereoDrift(rand), stereoDrift(rand)],
      process: [PROCESS[name](rand), PROCESS[name](rand)],
      grScale: GR_FULL_SCALE[name] || 12,
      rows: []
    };
    Array.prototype.forEach.call(groups, function (group) {
      var label = group.querySelector('.meters-head span');
      var role = group.classList.contains('meters--gr')
        ? 'gr'
        : label && /^input$/i.test(label.textContent.trim())
          ? 'in'
          : 'out';
      var bars = group.querySelectorAll('.meters-row i');
      Array.prototype.forEach.call(bars, function (bar, i) {
        card.rows.push({ bar: bar, role: role, ch: i, meter: role === 'gr' ? null : peakMeter() });
      });
    });
    mock.classList.add('meters-live');
    cards.push(card);
  });
  if (cards.length === 0) return;

  /* Off-screen cards stop costing anything. */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        cards.forEach(function (card) {
          if (card.mock === entry.target) card.visible = entry.isIntersecting;
        });
      });
    });
    cards.forEach(function (card) { io.observe(card.mock); });
  }

  var last = null;
  function frame(now) {
    // after a hidden tab or a long frame, resume rather than jump
    var dt = last === null ? 1 / 60 : Math.min(0.05, (now - last) / 1000);
    last = now;
    cards.forEach(function (card) {
      var src = card.source(dt);
      var levels = [0, 1].map(function (ch) {
        var inDb = src + card.drift[ch](dt);
        var r = card.process[ch](inDb, dt);
        return { in: inDb, out: r[0], gr: r[1] };
      });
      if (!card.visible) return;
      card.rows.forEach(function (row) {
        var l = levels[row.ch];
        var scale;
        if (row.role === 'gr') {
          // one reduction line: the larger of the two channels, as linked
          var g = Math.max(levels[0].gr, levels[1].gr);
          scale = Math.max(0.02, Math.min(1, g / card.grScale));
        } else {
          scale = levelScale(row.meter(row.role === 'in' ? l.in : l.out, dt));
        }
        row.bar.style.transform = 'scaleX(' + scale.toFixed(4) + ')';
      });
    });
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();
