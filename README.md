# Yaz's Gym

A small web app for following a workout program, logging sets/weights/notes,
and tracking total time in the gym. It's built to be added to an iPhone home
screen and works offline once opened.

## Using it on an iPhone

1. Open the site in **Safari**: https://colourdad.github.io/gym-app/
2. Tap **Share → Add to Home Screen**.
3. Open it from the home screen icon (not from Safari) from then on.

Logged data is saved on the phone. Use **Settings → Export backup** every week
or two and save the file to Files/iCloud. **Restore from backup** loads it back
(for example on a new phone).

> Data saved by the home screen app and by Safari are kept separately on iOS,
> so always use the home screen icon.

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # unit tests
npm run build      # production build into dist/
```

Pushing to `main` builds and deploys to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: repo **Settings → Pages →
Source: GitHub Actions**.

## How it's put together

```
src/
  types.ts                 data model (programs, sessions, settings)
  config.ts                name shown in the app
  data/programs/           workout programs, one file per block
  data/history-*.ts        history imported from the old spreadsheet
  lib/storage.ts           load/save + data migrations (only file that touches storage)
  lib/store.ts             global state, saved on every change
  lib/actions.ts           all the ways data is changed (start/finish session...)
  lib/stats.ts             hours, history, "last time" lookups
  lib/router.ts            hash routes (#/plan, #/session/<id>...)
  screens/                 one component per screen
  components/              shared UI pieces
public/sw.js               offline caching
```

### Common changes

**New program block** — copy `src/data/programs/october-2026.ts`, edit the
exercises/schedule, add it to the list in `src/data/programs/index.ts`, then
pick it in Settings. Reuse an exercise `id` (e.g. `rdl`, `bss`, `ham-curl`)
when it's the same movement so "last time" hints and history carry across
programs.

**Exercise type** — `measure` is `weight` (reps + kg), `reps`, `time`
(seconds) or `check` (just tick it off).

**New screen** — add a component in `src/screens/`, a route in `src/App.tsx`,
and a tab in `src/components/TabBar.tsx` if it needs one.

**Changing the saved data shape** — bump `CURRENT_VERSION` in
`src/lib/storage.ts` and add a migration step there so existing data on the
phone is upgraded instead of lost.

**Releasing an update** — bump `CACHE` in `public/sw.js` if offline caching
ever looks stale; the app picks up new versions next time it's opened with signal.
