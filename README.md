## Homepage of Zonghao Guo

Live site: [guozonghao96.github.io](https://guozonghao96.github.io/)

A static, dependency-free academic homepage (plain HTML, CSS and JavaScript) served by GitHub Pages.
A sticky sidebar holds the portrait and contact details; the content column is one scrolling page with
five sections: About, Research, Selected Publications, Honors and Experience.

### Structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page |
| `files/style.css` | Light academic styling, responsive and print-friendly |
| `files/main.js` | Publication filter and search, live GitHub / HuggingFace counters |
| `files/person_photo.jpg` | Portrait shown in the sidebar |
| `files/PaperFig/` | Publication thumbnails |
| `files/favicon.svg` | Site icon |
| `ZonghaoGuo.htm` | Redirect kept for the old page address |

### Editing

**Font size.** Everything is sized in `rem`, so the whole page scales from one variable: `--base`
in `files/style.css` (32px on wide screens, stepped down by the media queries for narrow ones).

**Adding a publication.** Copy an existing `<li class="pub">` block in the Selected Publications
section, keeping the list in reverse-chronological order, and set:

- `data-year` — used only for reference, the visible order comes from the markup order.
- `data-tags` — drives the filter buttons. Available tags: `mllm`, `video`, `rs`, `vision`, and
  `lead` for papers where I am first or corresponding author.

Inside the entry: `.pub-venue` holds the venue in red with a grey `.venue-note` for CCF class,
impact factor and authorship role; `.pub-note` is the one-line summary; `.pub-links` holds the
buttons. Publication numbering and the "showing N of M" counter update themselves; the totals in
the About section are written by hand.

**Thumbnails.** Entries without a figure use `<div class="pub-thumb is-placeholder">` showing the
venue name. To add a real figure, drop the image in `files/PaperFig/` and replace that div with
`<div class="pub-thumb"><img src="files/PaperFig/NAME.png" alt="" loading="lazy"></div>`.

**Live counters.** A chip with `data-gh="owner/repo"` is filled in with the current GitHub star
count, and `data-hf="user/model"` with the HuggingFace download count. Both are fetched on page
load, cached in `localStorage` for six hours, and stay hidden if the request fails, so the page
degrades quietly when the unauthenticated GitHub rate limit (60 requests per hour per visitor IP)
is exhausted.

**Printing.** `Cmd/Ctrl + P` hides the navigation, filters and visitor map and prints every section,
so the page doubles as a one-file CV.

### Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
