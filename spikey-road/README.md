# Road to Veracruz

A spikey desert adventure. A tiny pixel-art browser game. Plain HTML, CSS and JavaScript: no build step, no dependencies, no assets.

## How to play
- The journey to Veracruz is long and dangerous

- press: "shoot" to kill rattlesnakes in your path
- press: "up/down" to avoid spikey cactuses
- press: "jump" to jump over rocks and boulders

Reach the end of the road (100%) to win. Your best progress is saved in your browser.

## Controls
The road scrolls down the screen and your character stays at the bottom.

| Action | Keyboard | Touch |
|---|---|---|
| Move left / right | Left / Right or A / D | swipe left / right |
| Jump | Up, Space, W or X | swipe up |
| Shoot | F or Z | tap |
| Pause | P | |

Touch controls appear automatically on phones and tablets. A hint is shown on the first play, and each obstacle shows a short instruction the first time it appears (add `?tips` to the page address to see them again).

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000. (Opening `index.html` directly also works.)

## Deploy to GitHub Pages
1. Push this folder to a new GitHub repo (`index.html` at the repo root).
2. Repo **Settings -> Pages -> Build and deployment**: deploy from branch `main`, folder `/ (root)`.
3. Your game will be live at `https://<your-username>.github.io/<repo-name>/`.

Netlify, Vercel and Cloudflare Pages also work: just drag the folder in.

## License
Add a license of your choice (e.g. MIT) before publishing.
