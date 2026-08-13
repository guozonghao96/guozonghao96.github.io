## Homepage of Zonghao Guo

Live site: [guozonghao96.github.io](https://guozonghao96.github.io/)

A static, dependency-free academic homepage (plain HTML, CSS and JavaScript) served by GitHub Pages.

### Structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page: masthead plus five tabbed sections |
| `files/style.css` | Light academic styling, responsive and print-friendly |
| `files/main.js` | Tab switching, `#hash` deep links, publication filter and search |
| `files/person_photo.jpg` | Portrait shown in the masthead |
| `files/PaperFig/` | Publication thumbnails |
| `files/favicon.svg` | Site icon |
| `ZonghaoGuo.htm` | Redirect kept for the old page address |

### Editing

- **Add a publication** — copy an existing `<li class="pub">` block in `index.html`, place it in
  reverse-chronological order, and set `data-year` plus `data-tags`. Available tags are
  `mllm`, `detection`, `segmentation`, `representation` and `firstauthor`; they drive the filter
  buttons. Publication numbers and the "showing N of M" counter update automatically, but the
  counts in the masthead (`.metrics`) and the tab label (`.tab-count`) are written by hand.
- **Add an award** — uncomment and copy the template in the Honors panel.
- **Add a tab** — add a `<button class="tab" data-tab="name">` in `#tabs` and a matching
  `<section class="panel" id="panel-name">`; the `aria-controls` and `aria-labelledby`
  attributes must reference each other.
- Each tab is linkable, e.g. `…github.io/#publications`.
- `Cmd/Ctrl + P` prints every section at once, so the page doubles as a one-file CV.

### Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
