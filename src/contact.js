/* Support form submission.

   The markup ships in the page; this file only takes over the submit so a
   visitor stays on the page and gets a real answer either way. The site is
   served under `form-action 'none'`, so a native POST would be blocked —
   which is deliberate: the only path out of this page is the fetch below,
   to the one endpoint `connect-src` allows.

   Progressive by construction: with JS off the form simply does not submit,
   and the page says so rather than pretending to send. */
(function () {
  "use strict";

  var ENDPOINT = 'https://formspree.io/f/mrpzbbzp';

  var form = document.querySelector('.support-form');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var submit = form.querySelector('button[type="submit"]');
  var honeypot = form.querySelector('.form-hp input');

  function value(name) {
    var el = form.elements[name];
    return el ? String(el.value).trim() : '';
  }

  function say(kind, text) {
    status.className = 'form-status' + (kind ? ' form-status--' + kind : '');
    status.textContent = text;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    /* Bots fill every field they can see; a person never reaches this one.
       Report the same success they would get, so the difference teaches a bot
       nothing, and send nothing. */
    if (honeypot && honeypot.value.trim().length > 0) {
      form.hidden = true;
      say('sent', 'Thanks — your message is with the support desk.');
      return;
    }

    submit.disabled = true;
    say('', 'Sending…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: value('name'),
        email: value('email'),
        category: value('category'),
        os: value('os'),
        daw: value('daw'),
        message: value('message'),
        site: 'StudioZIO Hub',
        _subject: 'StudioZIO Hub support: ' + value('category') + ' — ' + value('name')
      })
    })
      .then(function (response) {
        /* A failure that reports success is worse than no form at all: the
           message never arrives and nobody knows to send it again. */
        if (!response.ok) {
          submit.disabled = false;
          say('error', 'The support desk rejected the message (HTTP ' + response.status + '). Please try again in a moment.');
          return;
        }
        form.reset();
        submit.disabled = false;
        say('sent', 'Thanks — your message is with the support desk. Replies normally go out within 24–48 business hours.');
      })
      .catch(function () {
        submit.disabled = false;
        say('error', 'The message could not be sent — check your connection and try again.');
      });
  });
})();
