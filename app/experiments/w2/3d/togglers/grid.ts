// The grid of switches on the phone = the grid of wave sources on the screen.
// Switch number (row × COLS + column) is the same on both pages.
export const COLS = 5;
export const ROWS = 8;
export const COUNT = COLS * ROWS; // 40 switches

// Every switch has its own rhythm, in radians per second: how fast its place on the surface is
// pushed up and down. The sound of that switch swells in the same rhythm.
export function rhythm(index: number) {
  return 2.2 + ((index * 7) % 11) * 0.22;
}
