# The Perfect Orchestrator — landing page

Static landing page for [The Perfect Orchestrator](https://github.com/daman8271/the-perfect-orchestrator) —
an open-source CLI (`orch`) where one lead Claude Code session commands N autonomous tmux
workers, and every result is adversarially verified by a different worker before it counts.

Zero frameworks, zero dependencies, zero build step. One HTML file, one CSS file, one JS file.

## Structure

```
index.html        the single page (all sections)
css/              single stylesheet
js/               single script (<14KB, no deps)
assets/           images + posters (logo, social card, favicons)
assets/video/     mp4 loops (hero, verify, explainer)
404.html          self-contained error page
vercel.json       static hosting config (clean URLs, security + cache headers)
robots.txt        canonical host lives here — single place to change
sitemap.xml       the one page
```

## Deploy

Hosted on Vercel as a plain static site — no build command, no output directory config.

```sh
npm i -g vercel       # once
vercel                # preview deploy
vercel --prod         # production deploy
```

If the production domain ever changes, update the canonical host in `robots.txt`
and `sitemap.xml` (and any `og:url` meta in `index.html`).

## Updating assets

Drop replacements into `assets/` (or `assets/video/`) under the **same filenames** —
all paths are pinned by the design brief. Keep videos web-friendly: h264, `+faststart`,
≤8MB each (re-encode with `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -vf scale=1920:-2
-movflags +faststart out.mp4`; keep the audio track only for `explainer.mp4`).
`assets/*` is served with 1-year immutable cache headers, so a changed asset needs a
new deploy to propagate.

## Provenance

`index.html`, `css/`, and `js/` are owned by the orchestrator build fleet that produced
this site — a lead Claude Code session and four autonomous workers, each owning its own
files and cross-verifying the others' results, coordinated by
[The Perfect Orchestrator](https://github.com/daman8271/the-perfect-orchestrator) itself.
Edit those files via a fleet run (or knowingly by hand); this repo is the deploy target,
the design contract lives in `DESIGN-BRIEF.md`.
