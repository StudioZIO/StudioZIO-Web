/* The moving part of the EXPECTED TP figure.

   Served from this origin as a classic script, like the rest, because the
   site's CSP has no 'unsafe-inline'.

   The arithmetic is the plug-in's and it is one line: EXPECTED TP is the
   ceiling less a fixed 0.01 dB allowance. The programme buttons are here to
   do nothing to that number, which is the note's point -- the audio is not in
   the sum, so changing it cannot move the readout. */
(function () {
  'use strict';

  var figure = document.querySelector('.tpfig');
  if (!figure) return;

  var ALLOWANCE = 0.01;

  var ceiling = '-1.0';
  var programme = 'quiet';

  function press(attribute, value) {
    var buttons = figure.querySelectorAll('[data-' + attribute + ']');
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-' + attribute) === value ? 'true' : 'false');
    }
  }

  function draw(changed) {
    var expected = (Number(ceiling) - ALLOWANCE).toFixed(2);
    figure.querySelector('.tpfig-ceiling').textContent = Number(ceiling).toFixed(1) + ' dB';
    figure.querySelector('.tpfig-expected').textContent = expected + ' dB';

    var summary = figure.querySelector('.osfig-summary');
    if (changed === 'programme') {
      /* Said in the past tense on purpose: the reader has just changed the
         programme and watched the number stay where it was. */
      summary.innerHTML = 'The programme changed. EXPECTED TP did not, because the audio was never in the sum.';
      return;
    }
    if (changed === 'ceiling') {
      summary.innerHTML = 'Ceiling ' + Number(ceiling).toFixed(1) + ' dB, less the fixed 0.01 dB allowance, is '
        + expected + ' dB.';
      return;
    }
    summary.innerHTML = 'The readout is the ceiling, less the allowance. Nothing else is in the sum.';
  }

  figure.addEventListener('click', function (event) {
    var pick = event.target.closest ? event.target.closest('.figdial-pick') : null;
    if (!pick || !figure.contains(pick)) return;

    if (pick.hasAttribute('data-ceiling')) {
      ceiling = pick.getAttribute('data-ceiling');
      press('ceiling', ceiling);
      draw('ceiling');
      return;
    }
    if (pick.hasAttribute('data-programme')) {
      programme = pick.getAttribute('data-programme');
      press('programme', programme);
      figure.setAttribute('data-programme', programme);
      draw('programme');
    }
  });
}());
