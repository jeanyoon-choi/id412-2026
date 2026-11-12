# Signature Contracts

Sign on the phone and press send. The laptop first shows your signature by itself, large, being written. Then it lands on 40 documents one after another, faster and faster: a parcel receipt, a terms-of-service screen, a lease, an employment contract, a loan, a surgery consent, a waiver of your own body, a will. The same signature writes itself on every one. At the end all 40 are on screen at once.

- Route: /experiments/w2/signature/contracts/mobile (phone) · /experiments/w2/signature/contracts/screen (laptop)
- Week: W2 · Tech: Socket.io, SVG (signature), HTML/CSS (documents)
- Inputs: one signature (strokes), sent with a button (discrete) → screen
- Parameters: ALONE (2800 ms), FIRST (1100 ms), FASTER (0.9), FASTEST (170 ms) (screen), the 40 entries of `documents.ts`

## How it works
- Both pages call `useSocket("signature-contracts", …)`.
- Mobile: strokes are kept as lists of points. "send" sends all of them in one message (`signature`), as fractions of the pad's width.
- Screen: `toInk` turns the strokes into one SVG path and the box that just fits it. The same path is reused on every document.
- The writing animation is CSS only: `pathLength={1}` makes the path "1 long", `stroke-dasharray: 1` with an animated `stroke-dashoffset` uncovers it from start to end.
- `step` is the whole timeline: -1 waiting, 0 the signature alone, 1..40 the documents, 41 the wall. One `setTimeout` per step; each document stays 0.9 × as long as the one before, down to 170 ms.
- `documents.ts` is the content: for each document its look (`form`, `legal`, `screen`, `receipt`), language, issuer, title, its own clauses and the label by the signature line. `Document.tsx` adds the small print and lays out the page.
- Pages are sized in em, so the same component is a full page (font-size 1vh) or a thumbnail in the wall (font-size 0.135vw).

## Run
pnpm dev → open /screen and click the /mobile link in its corner (new tab); sign with the mouse, press send. With a phone: open the same address with your computer's IP.

## Status / next
Written and type-checked. Next: your own list of documents, a sound per page (a pen, a stamp), or let several phones sign the same contract.
