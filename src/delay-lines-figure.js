/* The moving part of the two-delay-lines figure.

   The claim the note makes is arithmetic, so this does arithmetic. Two note
   divisions, each a fraction of a beat: the lines meet again after the lowest
   common multiple of the two, and the number of taps each lays down in that
   window is the window divided by its own division. A quarter against a
   dotted eighth meets after three beats, three taps against four -- the
   example the note gives, worked rather than asserted.

   Positions are set as a custom property because they are computed, not
   chosen: a tap sits wherever the arithmetic puts it, and a stylesheet cannot
   hold a class for every fraction. Nothing else here touches style. */
(function () {
  'use strict';

  var figure = document.querySelector('.dlfig');
  if (!figure) return;

  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  function parse(text) {
    var parts = String(text).split('/');
    var n = Number(parts[0]);
    var d = parts.length > 1 ? Number(parts[1]) : 1;
    var g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  /* The meeting point of two fractions: lcm of the numerators over gcd of the
     denominators, which is the standard result and keeps everything exact --
     no drift from adding 1/3 to itself in floating point. */
  function meet(a, b) {
    var n = (a.n * b.n) / gcd(a.n, b.n);
    var d = gcd(a.d, b.d);
    var g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  function value(f) { return f.n / f.d; }

  /* The window is a fraction of a beat as often as it is a whole number, and
     "every 1 beats" reads like a bug even when the number is right. */
  function window_(f) {
    if (f.d === 1) return f.n === 1 ? 'every beat' : 'every ' + f.n + ' beats';
    var fraction = f.n + '/' + f.d;
    return f.n < f.d ? 'every ' + fraction + ' of a beat' : 'every ' + fraction + ' beats';
  }

  function tapCount(n) { return n === 1 ? '1 tap' : n + ' taps'; }

  var state = { mode: 'two', left: '1/4', right: '1/8.' };

  function beatsOf(key) {
    var button = figure.querySelector('[data-left="' + key + '"]');
    return parse(button.getAttribute('data-beats'));
  }

  function labelOf(key) { return key; }

  function press(attribute, value) {
    var buttons = figure.querySelectorAll('[data-' + attribute + ']');
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-' + attribute) === value ? 'true' : 'false');
    }
  }

  function taps(lane, division, window) {
    lane.innerHTML = '';
    var step = value(division);
    var span = value(window);
    var count = 0;
    for (var at = 0; at < span - 1e-9; at += step) {
      var tap = document.createElement('span');
      tap.className = 'dlfig-tap';
      tap.style.setProperty('--at', ((at / span) * 100).toFixed(3) + '%');
      lane.appendChild(tap);
      count += 1;
    }
    return count;
  }

  function draw() {
    var right = state.mode === 'one' ? state.left : state.right;
    var a = beatsOf(state.left);
    var b = beatsOf(right);
    var window = meet(a, b);

    var left = taps(figure.querySelector('.dlfig-lane--left'), a, window);
    var rightTaps = taps(figure.querySelector('.dlfig-lane--right'), b, window);

    figure.setAttribute('data-mode', state.mode);
    press('mode', state.mode);
    press('left', state.left);
    press('right', right);

    var readout = figure.querySelector('.dlfig-readout');
    var summary = figure.querySelector('.osfig-summary');

    if (state.mode === 'one') {
      readout.textContent = 'Both sides on ' + labelOf(state.left) + ' — one time, offset either side of it.';
      summary.innerHTML = 'Both sides are counting the same subdivision, so there is no figure to hear — only a wider one.';
      return;
    }

    readout.textContent = 'Left ' + labelOf(state.left) + ', right ' + labelOf(right)
      + ' — ' + tapCount(left) + ' against ' + rightTaps + '.';
    summary.innerHTML = left === rightTaps
      ? 'Both sides land together ' + window_(window) + ', so the two lines stay in step.'
      : 'The two lines meet again ' + window_(window) + '.';
  }

  figure.addEventListener('click', function (event) {
    var pick = event.target.closest ? event.target.closest('.figdial-pick') : null;
    if (!pick || !figure.contains(pick)) return;

    if (pick.hasAttribute('data-mode')) state.mode = pick.getAttribute('data-mode');
    else if (pick.hasAttribute('data-left')) state.left = pick.getAttribute('data-left');
    else if (pick.hasAttribute('data-right')) state.right = pick.getAttribute('data-right');
    else return;

    draw();
  });

  draw();
}());
