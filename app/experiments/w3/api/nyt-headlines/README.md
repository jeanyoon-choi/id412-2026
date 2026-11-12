# NYT Headlines

Today's New York Times top stories, one headline at a time in very large serif type on white, changing every four seconds. The API example with a key.

- Route: /experiments/w3/api/nyt-headlines
- Week: W3 · Tech: API (New York Times Top Stories, free key), Route Handler
- Inputs: live news data, time
- Parameters: INTERVAL (4000 ms)

## How it works
- The New York Times API needs a key, and a key must not be in the browser. So the page does not call the Times: it calls our own Route Handler.
- `app/api/nyt-headlines/route.ts` runs on the server, reads `NYT_API_KEY` from `.env.local`, asks the Times, and returns only `{ headlines: [{ title, section }] }`.
- The page fetches `/api/nyt-headlines` once, then `setInterval` moves to the next headline.
- `key={index}` makes each headline a new element, so the CSS fade-in plays every time.

## Run
Get a free key at https://developer.nytimes.com (create an app, enable "Top Stories API"), put `NYT_API_KEY=...` in `.env.local`, restart pnpm dev → open the route.

## Status / next
Written and type-checked. Not run with a real key yet: without one the page shows the "NYT_API_KEY is missing" error. Next: show several headlines at once, or cut the words up.
