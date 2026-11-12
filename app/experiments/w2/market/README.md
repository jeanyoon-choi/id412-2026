# Market

A trading terminal for a stock market that does not exist: an index chart, 24 invented companies with flashing prices, a newswire. One finger on the phone moves all of it. Slide up and everything rallies; slide down and everything sells off; let go and the market calms down.

- Route: /experiments/w2/market/mobile (phone) · /experiments/w2/market/screen (laptop)
- Week: W2 · Tech: Socket.io, Canvas (chart), HTML/CSS (terminal)
- Inputs: finger height (continuous), finger lifted (discrete) → screen
- Parameters: SEND_INTERVAL (33 ms, mobile), TICK (100 ms), PULL (0.0022), NOISE (0.0018), CALM (0.985), NEWS_EVERY (2500 ms) (screen), each stock's `beta` (`market.ts`)

## How it works
- Both pages call `useSocket("market", …)`.
- Mobile: the finger's height becomes `sentiment`, +1 at the top, 0 in the middle, -1 at the bottom, sent at most every `SEND_INTERVAL` ms. Lifting the finger sends `release`.
- Screen: every `TICK`, each stock takes a step: `sentiment × PULL × beta` plus a random part. One number from the phone tilts 24 random walks.
- `beta` is per stock (`market.ts`): Goldfish Fisheries barely reacts, Frontier Models overreacts.
- The index is the average change of all stocks, starting at 1000. Its last minute is drawn on a canvas, green above 1000 and red below.
- A price takes green or red for one tick when it moved. The newswire picks a headline that fits the mood every `NEWS_EVERY` ms.
- After `release`, sentiment shrinks by `CALM` per tick: the prices stay where they are, the trend fades.

## Run
pnpm dev → open /screen and click the /mobile link in its header (new tab); press and drag up and down with the mouse. With a phone: open the same address with your computer's IP.

## Status / next
Written and type-checked. Next: sound (a tone that follows the index), or two phones: buyers against sellers.
