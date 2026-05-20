# Beyblade X Quiz

A client-only quiz site for GitHub Pages. Users see an image of a battling top and pick the correct name from four choices. No backend or database.

## Quick start (local)

Static files must be served over HTTP (not opened as `file://`) so `data/tops.json` can load.

```bash
# Python 3
python -m http.server 8080

# or Node (npx, no install)
npx --yes serve .
```

Open `http://localhost:8080`.

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
| `name`  | Display name shown as an answer choice           |
| `image` | Path from site root, e.g. `assets/images/tops/foo.png` |

You need **at least 4 tops** so each question can show one correct name and three wrong options.

### Attribution

Part names, stats, and images are sourced from the community [Beyblade X Viewer](https://beyblade.phstudy.org/) database. Use respectfully; re-run the import script if that site updates its data.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project.
2. In the repo: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. The site will be at `https://<username>.github.io/<repo-name>/`.

If the repo name is `Beyblade_quiz_app`, the URL is:

`https://<username>.github.io/Beyblade_quiz_app/`

## How the quiz works

- Choose **English**, **Japanese**, or **Traditional Chinese** on the start screen (names and UI update; choice is remembered).
- Choose which name parts appear in answers: **產品編號** (e.g. BX-04), **陀螺名稱** (e.g. 騎士重盾), **改裝組合** (e.g. 3-80N). Pick any combination — e.g. product + bey shows `BX-04 騎士重盾`.
- Up to 10 random questions per round (fewer if you have fewer tops).
- Four multiple-choice names per question (one correct, three random others).

## Project layout

```
index.html
css/style.css
js/app.js
data/tops.json
data/tops-meta.json
assets/images/tops/
scripts/import_phstudy.py
```
