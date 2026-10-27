# Playing the game as an app (Android tablet), and pushing updates to it

Built 2026-10-27. The game is packed as a PWA: an installable web page that keeps every file on the device, plays offline, and fetches a new build when you publish one.

## What ships

| File | Size | What it is |
|---|---|---|
| `index.html` | 14 MB | `play_game.html` with a few `<head>` tags and `app/pwa.js` added. The game itself is untouched. |
| `ambience/*.ogg` | 42 MB | the 36 sound loops (the game loads them by relative path) |
| `scenery/*.webp` | 30 MB | the 155 place backdrops |
| `icons/`, `manifest.webmanifest` | small | the home-screen icon and the install details |
| `sw.js`, `asset-manifest.json` | small | the offline worker and the list of every file with its hash |

`Wallpaper/`, `ICONS/` and `Sounds/` are the sources the art and sound tools convert from. They are never shipped.

## Everyday use

1. **Build:** `node tools/build_app.js` (or double-click `run-app-build.bat`). It runs `compile.js`, then rewrites `dist/` whole. `--no-compile` reuses the existing `play_game.html`.
2. **Serve:** `dist/` must be reachable over https. Two ways:
   * **Add a static route to the Mempalace server** (below). The tunnel and static domain you already have then serve the game too; a free ngrok plan gives one static domain, and the game needs its own address, so this is the usual choice.
   * `node tools/serve_app.js` serves `dist/` on `http://localhost:8088/` (testing on the PC; `localhost` counts as secure). Put a tunnel in front of it for the tablet.
3. **Tablet (Chrome):** open the address, wait for "Game files saved. It now works offline.", then menu, "Install app" (or "Add to Home screen"). It opens fullscreen from then on.
4. **Update:** build again. The next time the app is opened with a connection (or comes back to the front after five minutes) it downloads only the files whose hash changed, then shows **"Update ready. Save your game first." [Reload]**. Nothing changes under you until you tap Reload.

## The Flask route for the Mempalace server

Add to `server.py` (change the path if the project moves). It serves the game under `/game/`:

```python
from flask import send_from_directory

GAME_DIR = r"C:\Users\Kwesey\Desktop\choicescript-main\dist"

@app.route("/game/")
@app.route("/game/<path:p>")
def game_files(p="index.html"):
    resp = send_from_directory(GAME_DIR, p, conditional=True)   # conditional gives ETags and byte ranges (the sound loops need them)
    resp.headers["Cache-Control"] = "no-cache"
    return resp
```

The game then lives at `https://<your-static-domain>/game/`. Everything the app does is relative to its own address, so a sub-folder works. Gameplay logic stays out of the server: it only hands over files.

## How the offline worker works (`app/sw.js`)

* One cache per build (`cs-<build>`); a small `cs-meta` cache names the build being served (current) and a finished download waiting for you (pending).
* **First run:** downloads everything, the game page first, and names the build current as soon as the core is in, so it already plays offline while the sounds and backdrops are still arriving.
* **New build:** downloaded into its own cache. Files whose hash is unchanged are copied from the old cache instead of fetched. Only when every file is in does the page offer Reload.
* **Reload:** the pending build becomes current, old caches are deleted, the page reloads.
* Sounds are answered as 206 range responses from the cached file (an `<audio>` element asks for ranges).
* Every request the worker makes sends `ngrok-skip-browser-warning`, so ngrok's interstitial page is never mistaken for a game file.
* If the browser refuses cache storage, the game still plays from the network.

## Checked (headless Chrome against a built dist, `localhost`)

First install fills all 195 files; the page reloads with the server stopped; a range request for a sound answers 206 from the cache; a backdrop loads from the cache; a rebuilt dist makes the update card appear after fetching only `sw.js`, `asset-manifest.json` and `index.html` (no sounds or backdrops); the player stays on the old build until Reload; afterwards only the new build's cache remains.

## Not yet checked, or not built

* A real Android tablet: install prompt, fullscreen, sound start (browsers need one tap before audio plays; `ambience.js` already waits for it), and storage persistence.
* Touch and keyboard fixes (pinned hover cards, tap sizes, close buttons, a sound button) are the next chunk.
* Saves to the server (Sync saves) are the chunk after.
* The page is sent uncompressed by Flask; `tools/serve_app.js` gzips. A first download or update of the 14 MB page over mobile data is slow; Wi-Fi is fine.
* The dev-only link check in `web/mygame/index.html` (the `localhost` block) logs 404 errors in the console when testing on `localhost`; it does nothing on the tablet.
* The icon is `app/icon.svg` (a brass compass); change it and run `node tools/gen_app_icons.js`.
