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

  function show(el, label, value) {
    el.innerHTML = label + ' <b>' + compact(value) + '</b>';
    el.hidden = false;
  }

  document.querySelectorAll('[data-gh]').forEach(function (el) {
    var repo = el.dataset.gh;
    cached('gh:' + repo, function () {
      return fetch('https://api.github.com/repos/' + repo)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) { return d.stargazers_count; });
    }, function (v) {
      show(el, 'GitHub stars', v);
    });
  });

  document.querySelectorAll('[data-hf]').forEach(function (el) {
    var model = el.dataset.hf;
    cached('hf:' + model, function () {
      return fetch('https://huggingface.co/api/models/' + model)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) { return d.downloads; });
    }, function (v) {
      show(el, 'HF downloads', v);
    });
  });
})();
