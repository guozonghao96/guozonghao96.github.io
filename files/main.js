/* Zonghao Guo — homepage interactions: publication filtering and search. */
(function () {
  'use strict';

  var list = document.getElementById('pubList');
  var filters = document.getElementById('pubFilters');
  var search = document.getElementById('pubSearch');
  var status = document.getElementById('pubStatus');
  var empty = document.getElementById('pubEmpty');

  if (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll('.pub'));
    var total = items.length;
    var activeFilter = 'all';

    items.forEach(function (item) {
      item.dataset.text = item.textContent.replace(/\s+/g, ' ').toLowerCase();
    });

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;

      items.forEach(function (item) {
        var tags = ' ' + (item.dataset.tags || '') + ' ';
        var matchTag = activeFilter === 'all' || tags.indexOf(' ' + activeFilter + ' ') !== -1;
        var matchText = !query || item.dataset.text.indexOf(query) !== -1;
        var visible = matchTag && matchText;
        item.hidden = !visible;
        if (visible) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
      if (status) {
        status.textContent = shown === total
          ? 'Showing all ' + total + ' selected publications.'
          : 'Showing ' + shown + ' of ' + total + ' selected publications.';
      }
    }

    if (filters) {
      filters.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter');
        if (!btn) return;
        activeFilter = btn.dataset.filter;
        filters.querySelectorAll('.filter').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------- live GitHub stars / HF downloads ------------------- */
  /* Counts are cached in localStorage so a reload does not spend the
     unauthenticated GitHub rate limit (60 requests per hour per IP). */
  var CACHE_MS = 6 * 60 * 60 * 1000;

  function cached(key, fetcher, render) {
    var hit = null;
    try {
      hit = JSON.parse(localStorage.getItem(key));
    } catch (e) { /* private mode or corrupt entry */ }

    if (hit && typeof hit.v === 'number' && Date.now() - hit.t < CACHE_MS) {
      render(hit.v);
      return;
    }

    fetcher().then(function (value) {
      if (typeof value !== 'number' || isNaN(value)) return;
      try {
        localStorage.setItem(key, JSON.stringify({ v: value, t: Date.now() }));
      } catch (e) { /* storage full or unavailable */ }
      render(value);
    }).catch(function () { /* offline or rate limited: leave the chip hidden */ });
  }

  function compact(n) {
    if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  var GH_ICON = '<svg class="chip-ico" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 1.8a10.2 10.2 0 0 0-3.2 19.9c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0 0 12 1.8Z"/></svg>';
  var HF_ICON = '<span class="chip-emoji" aria-hidden="true">🤗</span>';

  function show(el, icon, value, label) {
    el.innerHTML = icon + '<span><b>' + compact(value) + '</b> ' + label + '</span>';
    el.setAttribute('title', label + ': ' + value.toLocaleString());
    el.hidden = false;
  }

  /* mark the link buttons with the icon of the service they point to */
  document.querySelectorAll('.pub-links a').forEach(function (a) {
    var host = a.href;
    if (host.indexOf('github.com') !== -1) a.insertAdjacentHTML('afterbegin', GH_ICON);
    else if (host.indexOf('huggingface.co') !== -1) a.insertAdjacentHTML('afterbegin', HF_ICON);
  });

  /* Total citations, scraped daily by .github/workflows/google-scholar-stats.yml.
     The number written in index.html stays visible if the fetch fails. */
  var citations = document.getElementById('gsCitations');
  if (citations) {
    cached('gs:citedby', function () {
      return fetch('https://raw.githubusercontent.com/guozonghao96/guozonghao96.github.io/google-scholar-stats/gs_data.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) { return d.citedby; });
    }, function (v) {
      citations.textContent = v.toLocaleString('en-US');
    });
  }

  document.querySelectorAll('[data-gh]').forEach(function (el) {
    var repo = el.dataset.gh;
    cached('gh:' + repo, function () {
      return fetch('https://api.github.com/repos/' + repo)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) { return d.stargazers_count; });
    }, function (v) {
      show(el, GH_ICON, v, 'stars');
    });
  });

  document.querySelectorAll('[data-hf]').forEach(function (el) {
    var model = el.dataset.hf;
    cached('hf:' + model, function () {
      return fetch('https://huggingface.co/api/models/' + model)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) { return d.downloads; });
    }, function (v) {
      show(el, HF_ICON, v, 'downloads');
    });
  });
})();
