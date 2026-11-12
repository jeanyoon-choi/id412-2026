// The fictional exchange: its listed companies and its newswire.
// beta = how strongly a stock follows the market's mood (1 = like the market, 2 = twice as wild).
export const STOCKS = [
  { ticker: "HNRV", name: "Han River Semiconductor", price: 71400, beta: 1.3 },
  { ticker: "DJRB", name: "Daejeon Robotics", price: 48250, beta: 1.6 },
  { ticker: "MNGO", name: "Mango Foods", price: 12800, beta: 0.5 },
  { ticker: "KAON", name: "Kaonashi Entertainment", price: 93100, beta: 1.8 },
  { ticker: "BNPO", name: "Banpo Property Trust", price: 254000, beta: 0.9 },
  { ticker: "VRNI", name: "Voronoi Systems", price: 33650, beta: 1.4 },
  { ticker: "SLSC", name: "Slit-Scan Optics", price: 18900, beta: 1.1 },
  { ticker: "TONE", name: "Tone Audio", price: 9420, beta: 0.8 },
  { ticker: "GLSL", name: "Shader Dynamics", price: 127500, beta: 2.0 },
  { ticker: "RLAY", name: "Relay Networks", price: 40100, beta: 1.0 },
  { ticker: "PRTK", name: "Particle Energy", price: 66300, beta: 1.2 },
  { ticker: "TGLR", name: "Toggler Electric", price: 27750, beta: 0.7 },
  { ticker: "SGNT", name: "Signature Trust Bank", price: 58900, beta: 0.6 },
  { ticker: "MWAL", name: "Media Wall Display", price: 21300, beta: 1.5 },
  { ticker: "FNGR", name: "Finger Skating Mobility", price: 83600, beta: 1.7 },
  { ticker: "YDPO", name: "Yeongdeungpo Steel", price: 315000, beta: 0.8 },
  { ticker: "KARM", name: "Karaoke Media", price: 7350, beta: 1.9 },
  { ticker: "TRBN", name: "Turbine Heavy Industries", price: 104500, beta: 1.0 },
  { ticker: "CLDF", name: "Cloud Field Data", price: 45900, beta: 1.5 },
  { ticker: "GFSH", name: "Goldfish Fisheries", price: 5610, beta: 0.4 },
  { ticker: "CTWK", name: "City Walk Retail", price: 16200, beta: 0.9 },
  { ticker: "OMGA", name: "Omega Biologics", price: 198000, beta: 2.2 },
  { ticker: "FRNT", name: "Frontier Models", price: 442000, beta: 2.4 },
  { ticker: "BLKR", name: "Black Room Holdings", price: 30950, beta: 1.1 },
];

// What the newswire says, by the market's mood.
export const HEADLINES = {
  up: [
    "XDX COMPOSITE EXTENDS RALLY AS BUYERS RETURN",
    "FRONTIER MODELS JUMPS ON RECORD ORDERS",
    "ANALYSTS RAISE TARGETS ACROSS TECHNOLOGY",
    "FOREIGN INVESTORS NET BUYERS FOR THIRD SESSION",
    "SHORT SELLERS RUSH TO COVER",
    "'THIS TIME IS DIFFERENT,' STRATEGIST SAYS",
  ],
  down: [
    "XDX COMPOSITE SLIDES AS SELLING ACCELERATES",
    "MARGIN CALLS HIT RETAIL ACCOUNTS",
    "CIRCUIT BREAKER WATCH: INDEX NEARS LIMIT",
    "OMEGA BIOLOGICS PLUNGES ON TRIAL DELAY",
    "FUNDS FLEE TO CASH",
    "'NOBODY SAW THIS COMING,' STRATEGIST SAYS",
  ],
  flat: [
    "MARKETS MIXED AHEAD OF RATE DECISION",
    "VOLUME THIN AS TRADERS WAIT",
    "XDX COMPOSITE LITTLE CHANGED",
    "ANALYSTS DIVIDED ON OUTLOOK",
  ],
};
