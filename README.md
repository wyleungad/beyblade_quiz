# Beyblade X Quiz

A client-only Beyblade X battling-top quiz for [GitHub Pages](https://pages.github.com/). See an image, pick the correct name from four choices, and browse a filterable catalog (圖鑑). No backend or database.

## Features

- **Quiz** — Up to 10 random questions per round; four choices each (one correct, three from the active deck).
- **圖鑑 / Catalog** — Grid of all tops with images; filter by product line.
- **Languages** — English, Japanese, and Traditional Chinese (UI + names). Language is chosen from a header dropdown and persists across every screen.
- **Answer display** — Show any combination of product number (e.g. `BX-04`), bey name (e.g. 騎士重盾), and combo (e.g. `3-80N`), with live examples on the start screen.
- **Syllabus filters** — Limit quiz and catalog to: **BX**, **BXC**, **BXH**, **BXG**, **CX**, **UX** (derived from product codes in each top’s name).
- **Results review** — After a round, see every question with the top image, correct name, and your wrong pick when applicable.
- **Animations** — Top spins in/out between questions; screen transitions when navigating; choice images reveal after each answer. Respects `prefers-reduced-motion`.

Preferences (language, display parts, quiz syllabus, catalog filters) are stored in `localStorage` on the device.

## Quick start (local)

Static files must be served over HTTP (not opened as `file://`) so `data/tops.json` can load.

```bash
# Python 3
python -m http.server 8080

# or Node (npx, no install)
npx --yes serve .
```

Open `http://localhost:8080`.

## How to use

1. **Start screen** — Set answer display parts and quiz syllabus lines, then tap **Start** (or open **圖鑑** / Catalog).
2. **Quiz** — Identify the top from its image. After answering, four choice images appear. Tap **Next** (or **測驗結果** / See results on the last question) to continue; the main top spins away, then the next one spins in.
3. **Results** — Score and a per-question breakdown with images. **Play again** starts a new round with the same settings.
4. **Back** — Header **Back** (返回 / 戻る) returns to the start screen from the quiz or catalog.

## Battle tops data (imported)

The deck is populated from [Beyblade X Viewer](https://beyblade.phstudy.org/?sortOrder=asc) (Series / complete battle tops). The importer downloads:

- **256** battle tops in `data/tops.json`
- Images in `assets/images/tops/` (~18 MB total)
- Extra fields (series ID, blade ID, release date, tags) in `data/tops-meta.json`

To refresh from the source site:

```bash
python scripts/import_phstudy.py
```

Optional: pass a locale code as the first argument (default `en-US`), e.g. `python scripts/import_phstudy.py ja-JP`.

### Manual entry format

Each top in `data/tops.json` needs:

| Field   | Description                                      |
|---------|--------------------------------------------------|
| `id`    | Unique slug, e.g. `sr-prd-910381-00`              |
| `name`  | Default display name (fallback)                  |
| `names` | Optional per-locale names: `en`, `ja`, `zh`      |
| `parts` | Optional parsed segments per locale (`product`, `bey`, `combo`) |
| `image` | Path from site root, e.g. `assets/images/tops/foo.png` |

You need **at least 4 tops** in the selected syllabus lines so each question can show one correct name and three distractors.

### Product lines (syllabus)

| Code | Example product | Notes |
|------|-----------------|--------|
| BX   | `BX-04`         | Main BX line |
| BXC  | `BXC-00-01`     | Metallic coat variants |
| BXH  | `BXH-01`        | Hyper line |
| BXG  | `BXG-01`        | Separate from BX |
| CX   | `CX-02`         | CX series |
| UX   | `UX-01`         | UX series |

### Attribution

Part names, stats, and images are sourced from the community [Beyblade X Viewer](https://beyblade.phstudy.org/) database. Use respectfully; re-run the import script if that site updates its data.

## Deploy to GitHub Pages

### Option A — GitHub Actions (included)

Pushes to the `master` branch deploy automatically via `.github/workflows/static.yml`.

### Option B — Branch deploy

1. Create a GitHub repository and push this project.
2. In the repo: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, branch `main` or `master`, folder `/ (root)`.
4. Save. The site will be at `https://<username>.github.io/<repo-name>/`.

If the repo name is `Beyblade_quiz_app`, the URL is:

`https://<username>.github.io/Beyblade_quiz_app/`

A `CNAME` file is included if you use a custom domain.

## Project layout

```
index.html              # App shell and screens
css/style.css           # Layout and animations
js/app.js               # Quiz, catalog, navigation, UI state
js/i18n.js              # UI strings (en / ja / zh)
js/name-parts.js        # Name parsing and formatted display
js/syllabus.js          # BX / BXC / BXH / BXG / CX / UX filtering
data/tops.json          # Deck used by the app
data/tops-meta.json     # Extra metadata from import
assets/images/tops/     # Top images
scripts/import_phstudy.py
scripts/patch_name_parts.py
scripts/patch_multilang_names.py
.github/workflows/static.yml
```

## Tech notes

- Vanilla HTML/CSS/ES modules only — no build step or framework.
- Quiz distractors are drawn from the same filtered deck as the questions.
- Syllabus for **BXH** / **BXC** / **BXG** is detected from the English `parts.product` prefix (longer prefixes are matched first so `BXH-01` is not classified as BX).
