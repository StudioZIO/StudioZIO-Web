/* Search across the four StudioZIO sites, matched in the visitor's browser.

   Served from this origin as a classic script because the site's CSP has no
   'unsafe-inline' -- the same reason gtag.js, consent.js and contact.js are
   files rather than inline blocks.

   There is no search server. The build writes one index file; this script
   downloads it once, on the first keystroke, and does the matching locally.
   That is why the CSP's connect-src can stay 'self', and why no query a
   visitor types ever leaves their machine. */
(function () {
  'use strict';

  var input = document.getElementById('search-query');
  var status = document.getElementById('search-status');
  var results = document.getElementById('search-results');
  if (!input || !status || !results) return;

  var INDEX_URL = '/assets/search-index.json';
  var MINIMUM = 2;
  var LIMIT = 24;
  var SNIPPET = 180;

  var index = null;
  var loading = null;
  var lastReported = '';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Case and accent folded once per page, on both sides of the comparison, so
     that "notarised" finds a heading that shouts NOTARISED and a Turkish
     keyboard's dotted capital does not miss a match. */
  function fold(value) {
    var text = String(value).toLowerCase();
    if (text.normalize) text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return text;
  }

  function terms(query) {
    return fold(query).split(/[^a-z0-9]+/).filter(function (term) {
      return term.length > 0;
    });
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(INDEX_URL, { credentials: 'omit' })
      .then(function (response) {
        if (!response.ok) throw new Error('index ' + response.status);
        return response.json();
      })
      .then(function (data) {
        index = data;
        index.pages.forEach(function (page) {
          page._title = fold(page.title);
          page._headings = fold((page.headings || []).join(' '));
          page._description = fold(page.description || '');
          page._text = fold(page.text || '');
        });
        return index;
      });
    return loading;
  }

  /* Weighted by where a word sits rather than how often it appears. A term in
     the title is what the page is about; the same term once in the body is
     usually an aside. Every term has to appear somewhere on the page, so a
     two-word query narrows instead of widening. */
  function score(page, wanted) {
    var total = 0;
    for (var i = 0; i < wanted.length; i += 1) {
      var term = wanted[i];
      var hit = 0;
      if (page._title.indexOf(term) !== -1) hit += 10;
      if (page._headings.indexOf(term) !== -1) hit += 4;
      if (page._description.indexOf(term) !== -1) hit += 3;
      if (page._text.indexOf(term) !== -1) hit += 1;
      if (hit === 0) return 0;
      total += hit;
    }
    return total;
  }

  function snippet(page, wanted) {
    var source = page.text || page.description || '';
    var folded = page._text || '';
    var at = -1;
    for (var i = 0; i < wanted.length && at === -1; i += 1) {
      at = folded.indexOf(wanted[i]);
    }
    if (at === -1) return escapeHtml(source.slice(0, SNIPPET)) + (source.length > SNIPPET ? '&hellip;' : '');

    var start = Math.max(0, at - Math.round(SNIPPET / 3));
    var end = Math.min(source.length, start + SNIPPET);
    if (start > 0) start = source.indexOf(' ', start) + 1 || start;
    var piece = source.slice(start, end);
    var marked = escapeHtml(piece);

    /* Highlighting runs over the escaped string, so a term that happens to
       look like markup cannot reopen a tag. */
    wanted.forEach(function (term) {
      var safe = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      marked = marked.replace(new RegExp('(' + safe + ')', 'gi'), '<strong>$1</strong>');
    });

    return (start > 0 ? '&hellip;' : '') + marked + (end < source.length ? '&hellip;' : '');
  }

  /* Every page's <title> ends in the property it belongs to, which the chip
     underneath already says. Dropping that tail leaves the part that tells
     the pages apart -- but only when it really is the tail, so the home
     page's own "StudioZIO \u2014 ..." keeps its whole line. */
  function displayTitle(title) {
    return String(title).replace(/\s*\u2014\s*StudioZIO[^\u2014]*$/, '').trim() || title;
  }

  /* The whole result is the link, not the three words of its title. This box
     exists to put a visitor somewhere else quickly, so the target it offers
     is the card they are already looking at -- 532 by 209 pixels of it, not
     374 by 23. */
  function card(page, wanted, index) {
    return '<a class="panel module-card search-hit" href="' + escapeHtml(page.url) + '"'
      + ' id="search-hit-' + index + '" data-hit="' + index + '">'
      + '<h3>' + escapeHtml(displayTitle(page.title)) + '</h3>'
      + '<p>' + snippet(page, wanted) + '</p>'
      + '<div class="chip-row"><span class="chip">' + escapeHtml(page.siteLabel) + '</span></div>'
      + '</a>';
  }

  /* GA4's own event name for site search, with its own parameter name, so the
     queries land in the standard report instead of a custom one nobody opens.
     Fired once a query settles, not on every keystroke, and never for the
     half-typed words on the way there. */
  function report(query) {
    if (query === lastReported) return;
    lastReported = query;
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'search', { search_term: query });
  }

  /* Arrow keys move through the results and Enter opens the one in hand, so a
     visitor who knows where they are going never has to reach for the mouse:
     type two letters, press down twice, press Enter. The highlight is the
     same border the cards take on hover, so the keyboard and the pointer show
     the same state. */
  var current = -1;

  function hits() {
    return results.querySelectorAll('.search-hit');
  }

  function select(index) {
    var all = hits();
    if (all.length === 0) { current = -1; input.removeAttribute('aria-activedescendant'); return; }
    current = Math.max(0, Math.min(index, all.length - 1));
    for (var i = 0; i < all.length; i += 1) {
      all[i].setAttribute('aria-selected', i === current ? 'true' : 'false');
    }
    input.setAttribute('aria-activedescendant', all[current].id);
    all[current].scrollIntoView({ block: 'nearest' });
  }

  function move(step) {
    var all = hits();
    if (all.length === 0) return;
    select(current < 0 ? (step > 0 ? 0 : all.length - 1) : (current + step + all.length) % all.length);
  }

  function open() {
    var all = hits();
    if (all.length === 0 || current < 0) return false;
    window.location.href = all[current].getAttribute('href');
    return true;
  }

  function render(query) {
    var wanted = terms(query);
    if (wanted.length === 0 || query.trim().length < MINIMUM) {
      results.innerHTML = '';
      status.textContent = '';
      select(0);
      return;
    }

    load().then(function (data) {
      var matches = [];
      data.pages.forEach(function (page) {
        var value = score(page, wanted);
        if (value > 0) matches.push({ page: page, value: value });
      });
      matches.sort(function (a, b) {
        return b.value - a.value || a.page.title.localeCompare(b.page.title);
      });

      if (matches.length === 0) {
        results.innerHTML = '';
        status.innerHTML = 'Nothing matches “' + escapeHtml(query.trim())
          + '”. <a href="/contact/">Support</a> can answer it directly.';
        return;
      }

      var shown = matches.slice(0, LIMIT);
      results.innerHTML = shown.map(function (match, index) {
        return card(match.page, wanted, index);
      }).join('');
      select(0);
      status.textContent = matches.length === 1
        ? '1 page matches.'
        : matches.length + ' pages match' + (matches.length > LIMIT ? ', showing the closest ' + LIMIT + '.' : '.');
      report(query.trim());
    }).catch(function () {
      results.innerHTML = '';
      status.textContent = 'The search index did not load. Reloading the page usually fixes it.';
    });
  }

  var timer = null;
  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      var query = input.value;
      render(query);
      /* The query travels in the address bar so a search can be linked to,
         and replaceState keeps the back button pointing at the page the
         visitor arrived from rather than at every word they typed. */
      var url = query.trim()
        ? window.location.pathname + '?q=' + encodeURIComponent(query.trim())
        : window.location.pathname;
      window.history.replaceState(null, '', url);
    }, 180);
  }

  input.addEventListener('input', schedule);

  function keys(event) {
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); return; }
    if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); return; }
    if (event.key === 'Enter') { if (open()) event.preventDefault(); return; }
    if (event.key === 'Escape' && event.target.value) {
      event.preventDefault();
      event.target.value = '';
      if (event.target !== input) input.value = '';
      schedule();
    }
  }

  input.addEventListener('keydown', keys);

  /* The header carries the same box on every page, including this one. Here
     it drives the list rather than navigating: the two stay in step, so a
     visitor who kept typing where they started is not answered by a page
     reload. */
  var headerFields = document.querySelectorAll('.header-search-field');
  Array.prototype.forEach.call(headerFields, function (field) {
    field.addEventListener('input', function () {
      input.value = field.value;
      schedule();
    });
    field.addEventListener('keydown', keys);
  });

  var initial = new URLSearchParams(window.location.search).get('q');
  if (initial) {
    input.value = initial;
    render(initial);
  }
  input.focus({ preventScroll: true });
}());
