/* The two figures on the Everything page. The markup already carries the
   final numbers, so a browser that never runs this -- or a reader who asked
   for reduced motion -- sees 7 and 1 exactly as they will end up. All this
   adds is the count. */
(function () {
  var nums = document.querySelectorAll('[data-count-to]');
  if (!nums.length) return;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) return;

  function run(el) {
    var from = Number(el.getAttribute('data-count-from'));
    var to = Number(el.getAttribute('data-count-to'));
    if (!isFinite(from) || !isFinite(to)) return;
    var start = null;
    var dur = 900;
    el.textContent = String(from);
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(nums, run);
    return;
  }
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      seen.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(nums, function (el) { seen.observe(el); });
})();
