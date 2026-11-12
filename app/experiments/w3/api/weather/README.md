# Weather

The wind right now in Daejeon, Reykjavik, Dubai or Wellington, drawn as hundreds of streaks blowing across a black screen. Pick a city in the lower-left corner. The first API example: live data in, parameters out.

- Route: /experiments/w3/api/weather
- Week: W3 · Tech: API (Open-Meteo, no key), Canvas
- Inputs: live weather data, city buttons
- Parameters: wind speed → streak speed, wind direction → heading, temperature → hue, cloud cover → opacity, STREAKS (400)

## How it works
- Open-Meteo is free and needs no key, so the page calls it directly with `fetch`. No Route Handler.
- The URL carries the city's latitude and longitude and the fields we want (`current=temperature_2m,wind_speed_10m,…`). The answer is JSON; the numbers are in `data.current`.
- The numbers are stored in a ref. The `requestAnimationFrame` loop reads them every frame and turns them into speed, heading, colour and opacity.
- Wind direction in weather data is where the wind comes from, so the streaks move toward direction + 180°.
- A new city → a new request. The data is fetched once per city, not continuously.

## Run
pnpm dev → open the route. Needs internet.

## Status / next
The API call was checked (it answers without a key); the page is type-checked. Next: add `precipitation` to the URL and draw rain, or drive a Tone.js synth with the wind speed.
