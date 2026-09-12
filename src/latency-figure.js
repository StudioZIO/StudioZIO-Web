/* The moving part of the reported-latency figure.

   Served from this origin as a classic script for the same CSP reason as the
   rest of the site's scripts.

   The figure is the host, not the plug-in: a reported latency is a number the
   host acts on by shifting every other track to match. The sample counts on
   the dial are hypotheticals the reader picks; the only product figure here
   is Tempo Delay's own, and it is zero. */
(function () {
  'use strict';

  var figure = document.querySelector('.latfig');
  if (!figure) return;

  /* The shift is drawn to the same scale as the choice -- 512 samples moves a
     quarter of the lane, not "a bit" -- and each distance is a class rather
     than an inline style, because this site's CSP allows no inline styles and
     the stylesheet is where sizes live. */
  function apply(samples) {
    figure.setAttribute('data-latency', String(samples));

    var labels = figure.querySelectorAll('.latfig-shift');
    labels[0].textContent = samples === 0 ? 'not moved' : 'moved ' + samples + ' samples';
    labels[1].textContent = 'reports ' + samples + ' samples';

    var buttons = figure.querySelectorAll('[data-latency]');
    for (var i = 0; i < buttons.length; i += 1) {
      if (buttons[i].tagName !== 'BUTTON') continue;
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-latency') === String(samples) ? 'true' : 'false');
    }

    var summary = figure.querySelector('.osfig-summary');
    summary.innerHTML = samples === 0
      ? 'At zero the host has nothing to compensate for, so nothing moves. This is what Tempo Delay reports.'
      : 'The host moves the dry track ' + samples + ' samples to keep it aligned &mdash; and on a parallel path '
        + 'that compensation has to be right on both branches.';
  }

  figure.addEventListener('click', function (event) {
    var pick = event.target.closest ? event.target.closest('.figdial-pick') : null;
    if (!pick || !figure.contains(pick)) return;
    apply(Number(pick.getAttribute('data-latency')));
  });
}());
