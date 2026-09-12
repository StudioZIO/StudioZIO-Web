/* The moving part of the architecture figure.

   One question, answered from the slices each product ships: Mastering Suite
   carries arm64 and x86_64, Tempo Delay carries arm64 only. Those are the
   note's facts and the catalogue's own metadata; this file only decides which
   of them applies to the Mac the reader says they are on. */
(function () {
  'use strict';

  var figure = document.querySelector('.archfig');
  if (!figure) return;

  var NEEDS = { apple: 'arm64', intel: 'x86_64' };

  function apply(machine) {
    var slice = NEEDS[machine];
    var products = figure.querySelectorAll('.archfig-product');
    var blocked = 0;

    for (var i = 0; i < products.length; i += 1) {
      var product = products[i];
      var slices = product.getAttribute('data-slices').split(' ');
      var runs = slices.indexOf(slice) !== -1;
      if (!runs) blocked += 1;
      product.setAttribute('data-verdict', runs ? 'runs' : 'blocked');
      product.querySelector('.archfig-verdict').textContent = runs
        ? 'runs natively'
        : 'will not load — no ' + slice + ' slice';
    }

    figure.setAttribute('data-machine', machine);
    var buttons = figure.querySelectorAll('[data-machine]');
    for (var b = 0; b < buttons.length; b += 1) {
      if (buttons[b].tagName !== 'BUTTON') continue;
      buttons[b].setAttribute('aria-pressed', buttons[b].getAttribute('data-machine') === machine ? 'true' : 'false');
    }

    var summary = figure.querySelector('.osfig-summary');
    summary.innerHTML = machine === 'apple'
      ? 'Both run natively on Apple Silicon.'
      : 'Mastering Suite runs natively on Intel. Tempo Delay has no Intel slice, and no installer name changes that.';
  }

  figure.addEventListener('click', function (event) {
    var pick = event.target.closest ? event.target.closest('.figdial-pick') : null;
    if (!pick || !figure.contains(pick)) return;
    apply(pick.getAttribute('data-machine'));
  });
}());
