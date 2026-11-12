// Eight phones, eight chat apps. The same sentence from the mobile lands in all of them;
// each room answers in its own voice.
export type Friend = { name: string; initial: string; tint: string };
export type Line = { from: number; text: string }; // from: index into friends, or -1 for "me"

export type App = {
  id: string; // also the name of its look in phone.module.css
  layout: "bubbles" | "rows"; // speech bubbles, or Slack-style rows
  title: string; // the room's name in the top bar
  detail: string; // small line under or beside the title
  friends: Friend[];
  before: Line[]; // what was already in the room
  persona: string; // told to the LLM: who answers here, and how
  dummies: string[]; // answers used when there is no LLM
};

export const APPS: App[] = [
  {
    id: "kakao",
    layout: "bubbles",
    title: "우리끼리",
    detail: "4",
    friends: [
      { name: "지민", initial: "지", tint: "#9fb4c9" },
      { name: "수아", initial: "수", tint: "#c4a9a0" },
      { name: "현우", initial: "현", tint: "#a3b39a" },
    ],
    before: [
      { from: 0, text: "오늘 저녁 뭐 먹지" },
      { from: 1, text: "ㅋㅋㅋ 또 그 얘기야" },
    ],
    persona: "A Korean group chat of close friends on KakaoTalk. Casual Korean, short, with ㅋㅋ or ㅠㅠ.",
    dummies: ["ㅋㅋㅋㅋㅋ 갑자기?", "헐 진짜?", "아 그건 좀...", "ㅇㅈ", "일단 만나서 얘기해"],
  },
  {
    id: "imessage",
    layout: "bubbles",
    title: "Mom",
    detail: "iMessage",
    friends: [{ name: "Mom", initial: "M", tint: "#8e96a8" }],
    before: [
      { from: 0, text: "Did you eat?" },
      { from: -1, text: "yes" },
    ],
    persona: "A mother texting her adult child on iMessage. Warm, slightly worried, plain English.",
    dummies: ["Call me when you can.", "Are you sleeping enough?", "Ok honey. Love you.", "What does that mean?", "Dad says hi."],
  },
  {
    id: "slack",
    layout: "rows",
    title: "# general",
    detail: "128 members",
    friends: [
      { name: "Daniel (PM)", initial: "D", tint: "#4a154b" },
      { name: "Minseo", initial: "M", tint: "#1264a3" },
      { name: "Theo", initial: "T", tint: "#2bac76" },
    ],
    before: [
      { from: 0, text: "Reminder: all-hands at 3pm. Cameras on, please." },
      { from: 1, text: "👍" },
    ],
    persona: "Coworkers in a company Slack channel. Polite corporate English, a little passive-aggressive.",
    dummies: ["Thanks for flagging! Let's take this offline.", "Could you put that in a ticket?", "+1", "Circling back on this tomorrow.", "Not sure this is the right channel for that."],
  },
  {
    id: "instagram",
    layout: "bubbles",
    title: "ari.jpg",
    detail: "Active now",
    friends: [{ name: "ari.jpg", initial: "A", tint: "#b09a7c" }],
    before: [
      { from: 0, text: "Replied to your story" },
      { from: 0, text: "omg where is this" },
    ],
    persona: "An acquaintance in Instagram DMs. Lowercase, enthusiastic, emojis, never asks a real question.",
    dummies: ["omg sameee 😭", "no way", "we should hang out sometime!!", "obsessed", "lol"],
  },
  {
    id: "whatsapp",
    layout: "bubbles",
    title: "Family ❤️",
    detail: "Dad, Mom, Auntie Grace, You",
    friends: [
      { name: "Auntie Grace", initial: "G", tint: "#7f9bb3" },
      { name: "Dad", initial: "D", tint: "#a99486" },
    ],
    before: [
      { from: 0, text: "Good morning family 🌞🙏" },
      { from: 1, text: "👍" },
    ],
    persona: "An extended family WhatsApp group. An aunt who forwards blessings and a father of few words.",
    dummies: ["God bless you 🙏", "👍", "Who is this? New number?", "When are you coming home?", "Forwarded: drink warm water every morning"],
  },
  {
    id: "discord",
    layout: "rows",
    title: "# off-topic",
    detail: "342 online",
    friends: [
      { name: "xX_kaonashi_Xx", initial: "K", tint: "#eb459e" },
      { name: "mango", initial: "M", tint: "#fee75c" },
      { name: "voronoi", initial: "V", tint: "#57f287" },
    ],
    before: [
      { from: 0, text: "anyone up for ranked" },
      { from: 1, text: "its 4am" },
    ],
    persona: "Strangers in a gaming Discord server at night. Lowercase, dry, ironic, internet slang.",
    dummies: ["skill issue", "real", "bro what", "touch grass", "L take but ok"],
  },
  {
    id: "telegram",
    layout: "bubbles",
    title: "Alpha Signals 🚀",
    detail: "41,208 subscribers",
    friends: [{ name: "Alpha Signals 🚀", initial: "A", tint: "#3390ec" }],
    before: [
      { from: 0, text: "BUY NOW before it is too late. Not financial advice." },
      { from: 0, text: "Last chance. 100x." },
    ],
    persona: "A Telegram investment channel bot. Turns anything into an urgent, capitalised trading signal.",
    dummies: ["BULLISH. Buy the dip.", "This changes everything. 100x.", "SELL. SELL. SELL.", "Whales are moving. Stay alert.", "Not financial advice 🚀"],
  },
  {
    id: "lineapp",
    layout: "bubbles",
    title: "ユキ",
    detail: "",
    friends: [{ name: "ユキ", initial: "ユ", tint: "#9c8fb0" }],
    before: [
      { from: 0, text: "おつかれさま〜" },
      { from: -1, text: "おつかれ！" },
    ],
    persona: "A Japanese friend on LINE. Short friendly Japanese with 〜 and ！.",
    dummies: ["えー！ほんと？", "わかる〜", "それな", "また今度ね！", "了解です！"],
  },
];
