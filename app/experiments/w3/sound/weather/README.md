# Weather

The weather of a place, right now, as a sound that never stops. Pick a place: its temperature, wind, rain and cloud cover are fetched live and each one holds one layer of the sound. Data in, continuous sound out.

- Route: /experiments/w3/sound/weather
- Week: W3 · Tech: Tone.js, API (Route Handler + Open-Meteo, no key)
- Inputs: choice of a place (discrete) → live weather data
- Parameters: PLACES, GLIDE (4 s), and the mapping lines at the end of `listen()`

## How it works
- The page sends `{ latitude, longitude }` to `app/api/weather/route.ts`. The route asks Open-Meteo and returns `{ temperature, wind, rain, cloud }`.
- The instrument is built once (`build()`): two sine waves (the air), filtered pink noise (the wind), filtered white noise (the rain), all through one lowpass filter (the sky).
- The mapping: temperature → pitch of the air, wind → loudness of the wind, rain → loudness of the rain, cloud → how far the last filter closes.
- Every change uses `rampTo(value, GLIDE)`, so the sound travels from one place to the next.
- The page shows the same mapping as a table: number, value, what it moves.

## Run
pnpm dev → open the route, click a place. Needs the internet.

## Status / next
The data arrives and the page runs without errors; the sound itself has not been listened to yet. Next: fetch again every few minutes, or add your own place.
