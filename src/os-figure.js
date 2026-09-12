/* The moving part of the per-stage oversampling figure.

   Served from this origin as a classic script for the same reason as the
   rest: the site's CSP has no 'unsafe-inline'.

   The figure ships rendered in its true state -- every stage at its own rate
   -- so a visitor without JavaScript reads the correct picture and simply
   cannot move it. This file only lets them move it.

   Nothing here decides what is right. Each stage carries the rate the plug-in
   runs it at, in data-rate; a chosen factor below that aliases, above it
   spends processor on margin the stage will never use, and at it is what
   shipped. That is the note's argument, not a new claim. */
(function () {
  'use strict';

  var figures = document.querySelectorAll('.osfig');
  if (figures.length === 0) return;

  /* Short enough for the row; the summary underneath says what it costs. */
  var VERDICT = {
    low: 'aliases',
    ok: 'as shipped',
    high: 'more than needed'
  };

  var NUMBER = ['no', 'one', 'two', 'three', 'four'];

  function count(n) {
    return NUMBER[n] || String(n);
  }

  function aliasPhrase(n) {
    return n === 1 ? 'one stage aliases' : count(n) + ' stages alias';
  }

  function wastePhrase(n) {
    return n === 1
      ? 'one stage spends processor on margin it will never use'
      : count(n) + ' stages spend processor on margin they will never use';
  }

  function apply(figure, choice) {
    var stages = figure.querySelectorAll('.osfig-stage');
    var aliasing = 0;
    var wasteful = 0;

    for (var i = 0; i < stages.length; i += 1) {
      var stage = stages[i];
      var rate = Number(stage.getAttribute('data-rate'));
      var running = choice === 'stage' ? rate : Number(choice);
      var state = running < rate ? 'low' : (running > rate ? 'high' : 'ok');
      if (state === 'low') aliasing += 1;
      if (state === 'high') wasteful += 1;

      stage.setAttribute('data-state', state);
      stage.querySelector('.osfig-rate').innerHTML = running + '&times;';
      stage.querySelector('.osfig-verdict').textContent = VERDICT[state];

      /* The lane is the running rate drawn as sample ticks, so 16x reads as
         four times denser than 4x rather than as a bigger number. */
      var lane = stage.querySelector('.osfig-lane');
      lane.className = 'osfig-lane osfig-lane--' + running;
    }

    var buttons = figure.querySelectorAll('.osfig-pick');
    for (var b = 0; b < buttons.length; b += 1) {
      buttons[b].setAttribute('aria-pressed', buttons[b].getAttribute('data-os') === String(choice) ? 'true' : 'false');
    }

    var summary = figure.querySelector('.osfig-summary');
    if (choice === 'stage') {
      summary.innerHTML = 'Every stage at the rate it needs — the one the plug-in ships.';
      return;
    }
    if (aliasing === 0 && wasteful === 0) {
      summary.innerHTML = 'At ' + choice + '× every stage happens to land on its own rate.';
      return;
    }
    /* The two ways a single factor is wrong are not the same failure, and
       saying so is the note's point: one stage aliasing is audible, another
       running high is only expensive. */
    var parts = [];
    if (aliasing) parts.push(aliasPhrase(aliasing));
    if (wasteful) parts.push(wastePhrase(wasteful));
    summary.innerHTML = 'At ' + choice + '×, ' + parts.join(', and ') + '.';
  }

  for (var f = 0; f < figures.length; f += 1) {
    (function (figure) {
      figure.addEventListener('click', function (event) {
        var pick = event.target.closest ? event.target.closest('.osfig-pick') : null;
        if (!pick || !figure.contains(pick)) return;
        apply(figure, pick.getAttribute('data-os'));
      });
    }(figures[f]));
  }
}());
