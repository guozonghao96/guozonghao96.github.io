/* Zonghao Guo — homepage interactions: tabbed sections and publication filtering. */
(function () {
  'use strict';

  /* ------------------------------- tabs ---------------------------------- */
  var tablist = document.getElementById('tabs');
  var tabs = tablist ? Array.prototype.slice.call(tablist.querySelectorAll('.tab')) : [];

  function panelOf(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  /* Position in the document flow. getBoundingClientRect() is unusable here
     because the tab bar is sticky and reports 0 once it is pinned. */
  function documentTop(el) {
    var y = 0;
    while (el) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  }

  function activate(name, opts) {
    opts = opts || {};
    var target = null;

    tabs.forEach(function (tab) {
      var isTarget = tab.dataset.tab === name;
      var panel = panelOf(tab);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      tab.tabIndex = isTarget ? 0 : -1;
      if (panel) panel.hidden = !isTarget;
      if (isTarget) target = tab;
    });

    if (!target) return false;
    if (opts.focus) target.focus();
    if (opts.scroll) {
      // start the new panel from its beginning, keeping the tab bar pinned on top
      var bar = document.querySelector('.tabs-bar');
      var top = bar ? documentTop(bar) : 0;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
    if (opts.hash !== false && history.replaceState) {
      history.replaceState(null, '', '#' + name);
    }
    return true;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activate(tab.dataset.tab, { scroll: true });
    });
  });

  if (tablist) {
    tablist.addEventListener('keydown', function (e) {
      var current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      var next = null;

      if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;

      e.preventDefault();
      activate(tabs[next].dataset.tab, { focus: true });
    });
  }

  function fromHash() {
    var name = (location.hash || '').replace('#', '');
    if (name) activate(name, { hash: false });
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* --------------------------- publications ------------------------------ */
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
          ? 'Showing all ' + total + ' publications.'
          : 'Showing ' + shown + ' of ' + total + ' publications.';
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

  /* ------------------------------ footer --------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
