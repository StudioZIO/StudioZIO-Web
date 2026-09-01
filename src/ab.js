/* StudioZIO A/B listener.

   Every card carries two <audio> elements holding the same passage: one
   unprocessed, one through the plug-in. Both are rendered from the plug-in
   itself and normalised to -12.0 LUFS integrated with peaks at or below
   -1 dBTP, measured on these encodes rather than on the masters, so the
   switch reveals processing rather than level.

   The two elements play in lock-step and the switch only changes which one
   is audible, so A and B line up in the listener's memory instead of asking
   them to remember across a restart. Audio is routed through Web Audio when
   the browser offers it, which gives a click-free crossfade and a real
   output meter; otherwise the script falls back to element volume.

   Nothing is fetched until someone presses play: the elements ship with
   preload="none" and the whole section costs two requests until then.

   It ships as its own file, not an inline <script>, because the site is
   served under `default-src 'self'` with no 'unsafe-inline'.
   scripts/validate.mjs asserts the parts this file reads. */

(function () {
  'use strict';

  var FADE_SECONDS = 0.015; // click-free, still reads as instantaneous
  var DRIFT_SECONDS = 0.06; // pull the pair back together before it is audible
  var cards = [];
  var audioContext = null;

  function context() {
    if (audioContext) return audioContext;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioContext = new Ctor();
    } catch (error) {
      audioContext = null;
    }
    return audioContext;
  }

  function clamp(value, low, high) {
    return value < low ? low : value > high ? high : value;
  }

  function Card(root) {
    this.root = root;
    this.media = [
      root.querySelector('audio[data-take="dry"]'),
      root.querySelector('audio[data-take="wet"]')
    ];
    this.playButton = root.querySelector('[data-ab="play"]');
    this.playLabel = root.querySelector('[data-ab="play-label"]');
    this.takeButtons = Array.prototype.slice.call(
      root.querySelectorAll('[data-ab="take"]')
    );
    this.progressBar = root.querySelector('[data-ab="progress-bar"]');
    this.progress = root.querySelector('[data-ab="progress"]');
    this.meter = root.querySelector('[data-ab="meter"]');
    this.meterFill = root.querySelector('[data-ab="meter-fill"]');
    this.take = 1; // the processed take is the one on show first
    this.gains = null;
    this.analyser = null;
    this.frame = null;
    this.bind();
    this.paint();
  }

  Card.prototype.bind = function () {
    var card = this;
    this.playButton.addEventListener('click', function () {
      card.toggle();
    });
    this.takeButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        card.select(index);
      });
    });
    this.media.forEach(function (element) {
      element.addEventListener('error', function () {
        card.fail();
      });
    });
    // Only ever one passage in the room.
    this.media[0].addEventListener('play', function () {
      cards.forEach(function (other) {
        if (other !== card) other.stop();
      });
    });
  };

  /* ---- routing ---------------------------------------------------------- */

  // Built on the first play, when a user gesture is guaranteed. Returns false
  // when the browser will not give us a graph; the card then falls back to
  // element volume, which switches audibly but still switches.
  Card.prototype.route = function () {
    if (this.gains) return true;
    var ctx = context();
    if (!ctx || !ctx.createMediaElementSource) return false;
    try {
      var analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      var card = this;
      this.gains = this.media.map(function (element, index) {
        var gain = ctx.createGain();
        gain.gain.value = index === card.take ? 1 : 0;
        ctx.createMediaElementSource(element).connect(gain);
        gain.connect(analyser);
        element.volume = 1;
        return gain;
      });
      analyser.connect(ctx.destination);
      this.analyser = analyser;
      this.levels = new Uint8Array(analyser.fftSize);
      return true;
    } catch (error) {
      this.gains = null;
      this.analyser = null;
      return false;
    }
  };

  Card.prototype.applyTake = function () {
    var card = this;
    if (this.gains) {
      var now = context().currentTime;
      this.gains.forEach(function (gain, index) {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(index === card.take ? 1 : 0, now + FADE_SECONDS);
      });
    } else {
      this.media.forEach(function (element, index) {
        element.volume = index === card.take ? 1 : 0;
      });
    }
  };

  /* ---- transport -------------------------------------------------------- */

  Card.prototype.playing = function () {
    return !this.media[this.take].paused;
  };

  Card.prototype.toggle = function () {
    if (this.playing()) this.stop();
    else this.start();
  };

  Card.prototype.start = function () {
    var card = this;
    var ctx = context();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    this.route();
    this.applyTake();
    var from = this.media[this.take].currentTime;
    var attempts = this.media.map(function (element) {
      element.currentTime = from;
      return element.play();
    });
    attempts.forEach(function (attempt) {
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          card.fail();
        });
      }
    });
    this.paint();
    this.tick();
  };

  Card.prototype.stop = function () {
    this.media.forEach(function (element) {
      element.pause();
    });
    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.setLevel(0);
    this.paint();
  };

  Card.prototype.fail = function () {
    this.stop();
    this.root.classList.add('is-blocked');
  };

  // Switching takes keeps both heads together, so the ear compares the same
  // instant of the passage rather than two different places in it.
  Card.prototype.select = function (index) {
    if (index === this.take) return;
    var from = this.media[this.take].currentTime;
    this.take = index;
    this.media.forEach(function (element) {
      if (Math.abs(element.currentTime - from) > 0.02) element.currentTime = from;
    });
    this.applyTake();
    this.paint();
  };

  /* ---- readouts --------------------------------------------------------- */

  Card.prototype.setLevel = function (ratio) {
    if (this.meterFill) this.meterFill.style.width = (ratio * 100).toFixed(1) + '%';
  };

  Card.prototype.paint = function () {
    var card = this;
    var playing = this.playing();
    this.playButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
    if (this.playLabel) this.playLabel.textContent = playing ? 'Stop' : 'Hear it';
    this.root.classList.toggle('is-playing', playing);
    this.takeButtons.forEach(function (button, index) {
      button.setAttribute('aria-pressed', index === card.take ? 'true' : 'false');
    });
  };

  // Chromium reports an infinite duration for these Ogg streams, and both
  // seekable and buffered follow it, so every reading the browser offers is
  // either infinite or still growing. A progress bar divided by infinity sits
  // at zero for the whole passage, which is worse than no bar at all. The
  // build reads the real length out of the file and puts it on the card; see
  // src/media.mjs. The browser's own duration is used only if that is missing.
  Card.prototype.length = function () {
    var declared = parseFloat(this.root.getAttribute('data-length'));
    if (declared > 0) return declared;
    var duration = this.media[this.take].duration;
    return duration > 0 && isFinite(duration) ? duration : 0;
  };

  Card.prototype.tick = function () {
    var card = this;
    var element = this.media[this.take];
    var duration = this.length();

    if (duration > 0) {
      var ratio = clamp(element.currentTime / duration, 0, 1);
      if (this.progressBar) this.progressBar.style.width = (ratio * 100).toFixed(2) + '%';
      if (this.progress) this.progress.setAttribute('aria-valuenow', Math.round(ratio * 100));
    }

    if (this.analyser && this.levels) {
      this.analyser.getByteTimeDomainData(this.levels);
      var peak = 0;
      for (var i = 0; i < this.levels.length; i += 4) {
        var deviation = Math.abs(this.levels[i] - 128);
        if (deviation > peak) peak = deviation;
      }
      // 128 is full scale for this reading. The curve keeps a -12 LUFS
      // passage legible across the bar without pretending it is louder.
      this.setLevel(Math.pow(clamp(peak / 128, 0, 1), 0.62));
    }

    // Two elements will drift apart; pull them back before it is audible.
    var other = this.media[this.take === 0 ? 1 : 0];
    if (Math.abs(other.currentTime - element.currentTime) > DRIFT_SECONDS) {
      other.currentTime = element.currentTime;
    }

    if (this.playing()) {
      this.frame = window.requestAnimationFrame(function () {
        card.tick();
      });
    } else {
      this.frame = null;
      this.setLevel(0);
      this.paint();
    }
  };

  function boot() {
    var roots = document.querySelectorAll('[data-ab="card"]');
    Array.prototype.forEach.call(roots, function (root) {
      cards.push(new Card(root));
      root.classList.add('is-ready');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
