/* The moving part of the feedback-loop figure.

   It counts, and counts only. A filter after the delay touches every repeat
   once; a filter inside the loop touches repeat n n times. That is the note's
   claim and it is arithmetic, so it is the whole of what this draws.

   There is deliberately no dB figure anywhere in here. How dark the eighth
   repeat gets depends on the setting, and inventing a curve would be
   answering a question the note does not answer. */
(function () {
  'use strict';

  var figure = document.querySelector('.loopfig');
  if (!figure) return;

  var state = { place: 'inside', repeats: 6 };

  function press(attribute, value) {
    var buttons = figure.querySelectorAll('[data-' + attribute + ']');
    for (var i = 0; i < buttons.length; i += 1) {
      if (buttons[i].tagName !== 'BUTTON') continue;
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-' + attribute) === String(value) ? 'true' : 'false');
    }
  }

  function draw() {
    var list = figure.querySelector('.loopfig-repeats');
    list.innerHTML = '';

    for (var n = 1; n <= state.repeats; n += 1) {
      var passes = state.place === 'inside' ? n : 1;
      var row = document.createElement('li');
      row.className = 'loopfig-repeat';

      var label = document.createElement('span');
      label.className = 'loopfig-n';
      label.textContent = 'Repeat ' + n;
      row.appendChild(label);

      var marks = document.createElement('span');
      marks.className = 'loopfig-marks';
      for (var p = 0; p < passes; p += 1) {
        var mark = document.createElement('i');
        mark.className = 'loopfig-mark';
        marks.appendChild(mark);
      }
      row.appendChild(marks);

      var count = document.createElement('span');
      count.className = 'loopfig-passes';
      count.textContent = passes === 1 ? 'through the filter once' : 'through the filter ' + passes + ' times';
      row.appendChild(count);

      list.appendChild(row);
    }

    figure.setAttribute('data-place', state.place);
    press('place', state.place);
    press('repeats', state.repeats);

    var readout = figure.querySelector('.dlfig-readout');
    var summary = figure.querySelector('.osfig-summary');

    if (state.place === 'after') {
      readout.textContent = 'After the delay — every repeat passes the filter once.';
      summary.innerHTML = 'The tail is darker than the source, and it stays that darkness all the way down.';
      return;
    }
    readout.textContent = 'Inside the loop — every pass goes through the filter again.';
    summary.innerHTML = 'By repeat ' + state.repeats + ' the filter has been applied ' + state.repeats
      + ' times. A setting that was mild on the first repeat is the dominant character by then.';
  }

  figure.addEventListener('click', function (event) {
    var pick = event.target.closest ? event.target.closest('.figdial-pick') : null;
    if (!pick || !figure.contains(pick)) return;
    if (pick.hasAttribute('data-place')) state.place = pick.getAttribute('data-place');
    else if (pick.hasAttribute('data-repeats')) state.repeats = Number(pick.getAttribute('data-repeats'));
    else return;
    draw();
  });

  draw();
}());
