# THE PERFECT ORCHESTRATOR — Landing Page Design Brief v1
**This document is the contract. Every worker builds against it. Deviations need a bus post + lead approval.**

## 0. Product truth (do not soften)
Open-source CLI (`orch`) — one lead Claude Code session commands N autonomous Claude Code
workers in tmux. Workers coordinate via a file bus, results are **adversarially verified
by a different worker** before they count. MIT. Pure bash+tmux+files. No daemons, no
servers, no experimental flags. Repo: https://github.com/daman8271/the-perfect-orchestrator
Essence to radiate: **made for vibe coders** — people who command AI, not babysit it.

## 1. Visual identity
### Palette (CSS custom properties — exact)
```css
:root {
  --bg:        #0a0e14;   /* page base — darker than GitHub dark */
  --bg-raised: #0f141d;   /* cards, terminal chrome */
  --bg-glass:  rgba(15,20,29,.72);
  --line:      rgba(63,185,80,.14);   /* hairline borders, green-tinted */
  --line-hot:  rgba(63,185,80,.38);
  --bg-void:   #060911;   /* page body + #vibe band — deepest layer */
  --green:     #3fb950;   /* terminal green — primary accent */
  --green-hi:  #56d364;
  --cyan:      #56d4dd;   /* secondary accent, links/hovers, [Wn] bus tags */
  --amber:     #e3b341;   /* flagship gold — the LEAD color, CTAs */
  --red:       #f85149;   /* REFUTED */
  --ink:       #e6edf3;   /* primary text */
  --ink-mute:  #9aa4b2;   /* secondary text */
  --ink-faint: #58616e;   /* captions, meta */
}
```
Color discipline: green = workers/system, amber = the lead/commands/CTA, red ONLY for
REFUTED moments, cyan sparingly for hover/links. Never more than 2 accents in one view.

### Typography (v1.1 — Inter DROPPED, two fonts total)
- Headlines + body: **Space Grotesk** 300..700 (Google Fonts) — body text 400
- Terminal/code/labels/tables: **JetBrains Mono** 400/700 (Google Fonts)
- Rule: marketing copy never in mono; terminal content never in Grotesk.
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:ital,wght@0,400;0,700&display=swap" rel="stylesheet">
```
Scale: h1 clamp(2.6rem, 6vw, 4.6rem) ls -0.03em; h2 clamp(1.9rem,3.5vw,2.6rem);
overline labels: JetBrains Mono 0.78rem uppercase ls 0.18em color var(--green).
Body 1.06rem/1.7. Max text column 62ch.

### Texture & depth
- Subtle grain overlay on the whole page (SVG feTurbulence, opacity .035, pointer-events none).
- Sections separated by hairline `--line` borders and radial glow auras (green/amber at 6-8% alpha).
- Cards: bg-raised, 1px line border, 14px radius; hover lifts border to --line-hot + soft glow.
- Terminal windows: macOS-style chrome (3 dots), JetBrains Mono, #0a0e14 inner.

## 2. Page architecture (section order, ids, owner copy)
All sections live in `<main>`. Each section: `<section id="…" class="section">` with inner `<div class="wrap">` (max-width 1140px).

### `#nav` — sticky glass nav
Logo mark (assets/logo.png, 28px) + "THE PERFECT ORCHESTRATOR" in JetBrains Mono 0.82rem ls .12em.
Links: How it works · Commands · Patterns · Compare · FAQ. Right: GitHub button (amber outline → fill on hover) with live-ish star icon.
Transparent at top → glass (backdrop-blur + bg-glass + bottom hairline) after 40px scroll (JS adds `.scrolled`).

### `#hero`
- Background: `assets/video/hero-loop.mp4` full-bleed, muted autoplay loop playsinline, poster `assets/hero-poster.jpg`, dark gradient overlay (transparent → var(--bg) at bottom) so text sits on solid.
- Overline: `$ MADE FOR VIBE CODERS` (mono, green, typed-in by JS with caret)
- H1: `Command a fleet of Claude coders.` then accent line in amber italic-none: `Trust none of them.`
- Sub (62ch): `The Perfect Orchestrator turns one Claude Code session into the commander of N autonomous tmux workers — and every result gets adversarially verified by a different worker before it reaches you.`
- CTA row:
  1. Install box `.cmd-copy` (mono, animated conic-gradient border, click-to-copy):
     `git clone https://github.com/daman8271/the-perfect-orchestrator && cd the-perfect-orchestrator && ./install.sh`
  2. Ghost button: `★ Star on GitHub` → repo URL.
- Credibility chips row `.chips`: `MIT licensed` · `bash + tmux + files` · `zero daemons` · `no experimental flags` · `works with your Claude plan`
- Scroll cue: thin mono `▼ scroll` fading.

### `#problem` — the hook ("your agents lie")
Overline: `THE PROBLEM`
H2: `Every agent says "done." Some of them are lying.`
Left: 3 short paragraphs max — the pain: you fan out agents, they rubber-stamp, declare victory, hallucinate "all tests pass". The more agents you run, the less you can check. Autonomy without verification is noise.
Right: `.terminal` window, static content — a worker claiming `✅ Done — all 14 tests passing.` then below, red-tinted verifier line: `[W4 verifier] REFUTED — test suite was never run. Exit code 127.` Caption (mono, faint): `real pattern. independent eyes kill false positives.`
Below the terminal (deferred ask — only after the proof moment): quiet one-liner with a text link to the repo: `If that just sold you — a star helps other vibe coders find it.`

### `#how` — how it works
Overline: `HOW IT WORKS` / H2: `One lead. N workers. A bus they can't bluff.`
3 step cards `.steps` (numbered 01/02/03, mono numbers in amber):
1. **SPAWN** — `orch spawn audit 6` — six full Claude Code sessions bloom in tmux panes. Real TUIs you can watch, not invisible API calls.
2. **COMMAND** — the lead writes each worker a brief file, dispatches, then *watches* — reading panes, nudging the ones that drift. The lead is alive, not a cron job.
3. **VERIFY** — done-flags drop, results land — and a different worker tries to tear each one apart. Survivors get reported. Liars get caught.
Below: full-width `.terminal#demo-terminal` — JS-typed simulation (see §4) of a real session.
Then `assets/video/verify-loop.mp4` (muted loop, lazy) with caption: `the verification pass, visualized.`

### `#verify` — the differentiator spotlight
Overline: `TRUST NOTHING` / H2: `The only fleet where workers audit each other.`
Lead para: We surveyed every public Claude-fleet orchestrator (and Anthropic's experimental Agent Teams). Adversarial result-verification existed in none of them. It exists here, as the core design rule: *findings don't count until a different worker has tried to kill them.*
FOUR mini-stats `.stat` (count-up on reveal, survey methodology as credibility): `15` primary sources fetched · `74` claims extracted · `24` confirmed by adversarial panels · `1` refuted and excluded. Labels mono faint.
Link (cyan, mono): `read the full landscape survey →` (repo docs/LANDSCAPE.md URL)
Optional media: `assets/video/explainer.mp4` — short captain analogy clip with sound, click-to-unmute card styled like a film slate.

### `#commands` — the CLI reference
Overline: `THE HARNESS` / H2: `Seven commands. Zero ceremony.`
`.cmd-grid` of 7 rows (mono): orch spawn/send/read/status/kill/doctor/worker + one-line description each (copy from repo README table, tighten). Each row: command in green, args in ink-mute, description in body font.

### `#patterns` — battle scars
Overline: `LEARNED IN PRODUCTION` / H2: `Patterns with scar tissue.`
Intro line: These came from running real fleets on real revenue work — multi-platform price-intelligence ops, cross-module sweeps — not from demos.
5 `.pattern-card`s: **Find → verify** (independent eyes kill false positives) · **Brief neutrally** (don't pre-declare the cause — workers investigate, instead of rubber-stamping; this caught the lead being wrong, repeatedly) · **One owner per file** (parallel edits collide; one owner, requests via bus) · **Commit local, lead pushes** (workers never push; the lead reviews every commit) · **3× cross-verify** (audit → refute → confirm survivors).

### `#compare` — comparison table
Overline: `THE LANDSCAPE` / H2: `We checked everyone. Then built what was missing.`
Table (rows = capabilities, cols = TPO / Tmux-Orchestrator / claude-squad / primeline / Agent Teams) — exact data from repo README comparison. TPO column highlighted (amber hairline + glow). ✅/⚠️/❌ as styled glyphs, footnotes under table in mono faint: `survey snapshot 2026-06-05 — full sources in docs/LANDSCAPE.md`.

### `#vibe` — identity manifesto (THE essence section)
Full-bleed darker band, centered, big type. Overline: `$ whoami` (mono green).
Manifesto lines (Space Grotesk 700, staggered reveal, one per line):
`You don't write every line anymore.`
`You command the ones who do.`
`Your terminal is a bridge, not a desk.`
`Made for vibe coders.` ← amber, larger
Sub-line (mono, faint): `the people who ship at 3am with eight panes glowing.`

### `#start` — quickstart
Overline: `60 SECONDS TO A FLEET` / H2: `Start commanding.`
3 numbered `.cmd-copy` boxes:
1. `git clone https://github.com/daman8271/the-perfect-orchestrator && cd the-perfect-orchestrator`
2. `./install.sh && orch doctor`
3. `# inside Claude Code:  /orch  — then describe the job`
Below: ghost link `or read the docs →`.

### `#faq`
H2: `Questions you're right to ask.`
`<details>` accordions (5): tokens/cost? · is it safe to run autonomous workers? (security model summary + rm-not-allowlisted) · why tmux not headless SDK? (observability is the feature) · what about Anthropic's Agent Teams? (experimental/flagged; we run today; compat layer on roadmap) · when NOT to use this? (single quick task — just do it yourself).

### `#footer`
Hairline top. Left: logo mark + `MIT © 2026 danny (daman8271)`. Center (mono, faint): `this site was designed, written, and shipped by the very fleet it advertises.` Right: GitHub · Landscape survey · Security model.

## 3. Class/ID contract (CSS + JS must use exactly these)
ids: `nav, hero, problem, how, verify, commands, patterns, compare, vibe, start, faq, footer, demo-terminal`
classes: `.wrap .section .overline .lead .chips .chip .btn .btn-amber .btn-ghost .cmd-copy .terminal .term-head .term-body .steps .step .stat .stats .cmd-grid .cmd-row .pattern-card .cards .table-wrap .manifesto .m-line .accordion .reveal .reveal-stagger .grain .scrolled .typed .caret`
JS hooks: `[data-copy]` (click-to-copy, swaps label to `copied ✓` 1.2s), `[data-typed]` (terminal typing), `[data-count]` (count-up), `.reveal` (IntersectionObserver adds `.in`), `#nav` scroll state, `[data-video-lazy]` (set src + play when in view).

## 4. The typed terminal demo script (JS types this, line by line)
```
$ orch spawn audit 4 ~/prod-api
spawned orch-audit: 4 workers | workdir=/home/you/prod-api
$ orch send audit 1 --file shared/agent-1.task.md
-> W1: Read and follow the instructions… begin.
[bus] [W2] unsafe redirect in auth/login.js:114 → posted
[bus] [W3] 3 endpoints missing rate limits → posted
$ orch status audit
-- done flags --  agent-1.done  agent-2.done  agent-3.done
[bus] [W4 verifier] W2 finding CONFIRMED · W3 #2 REFUTED — false positive, killed
$ # survivors only. that's the point.
```
Type speed ~24ms/char, instant for output lines (fade-in), green prompt `$`, amber for `[W4 verifier]` line's CONFIRMED/REFUTED words (red for REFUTED). Respect `prefers-reduced-motion` (render final state instantly).

## 5. Motion plan
- All entrances: `.reveal` → IntersectionObserver at 12% → opacity 0→1 + translateY(22px→0), 600ms cubic-bezier(.2,.7,.2,1); `.reveal-stagger` children +70ms each.
- Hero: video fades in over poster; H1 words slide-mask in; chips stagger.
- `.cmd-copy`: 1px animated conic-gradient border (amber→green, 6s linear loop, paused on reduced-motion).
- Stats count up over 900ms when revealed.
- Manifesto lines: slide-mask reveal on scroll, last line gets amber glow pulse once.
- NOTHING animates layout properties — transform/opacity only. No scroll-jacking. No parallax beyond hero gradient shift.

## 6. Performance & quality budget
- Lighthouse ≥95 all categories. Single CSS file, single JS file (<14KB min), zero dependencies, zero frameworks.
- Videos: preload=none + poster; IntersectionObserver starts/pauses them. mp4 h264 ≤2.5MB each (use provided files; do not re-encode in-page).
- Images: width/height attrs, lazy except hero poster. Fonts: display=swap, preconnect.
- Full semantic HTML, one h1, alt text everywhere, focus-visible styles, aria on accordion/copy buttons, contrast ≥4.5 for body text.
- og/twitter meta: title `The Perfect Orchestrator — command a fleet of Claude coders`, desc `One lead Claude session commands N autonomous tmux workers. Every result adversarially verified. MIT, bash+tmux, zero daemons.`, image `assets/social-card.png`, twitter:card summary_large_image.

## 7. Asset manifest (provided by lead — do not invent paths)
```
assets/hero-poster.jpg          first frame of hero loop (lead provides)
assets/video/hero-loop.mp4      armada ambient loop (lead provides)
assets/video/verify-loop.mp4    verification pulse loop (lead provides)
assets/video/explainer.mp4      voiced captain clip (lead provides)
assets/logo.png                 flagship beacon mark (lead provides)
assets/social-card.png          og image (provided)
assets/verification.png         conductor diagram still (provided)
```
If an asset is missing at build time, build with the path anyway + graceful poster/alt fallback.
