import type { Doc } from "./documents";
import styles from "./page.module.css";

// One page, with the signature being written on its signature line.
// Everything is sized in em, so the same page works full-size and as a thumbnail.

// The small print every contract has, by language. It fills the page under the document's own clauses.
const SMALL_PRINT: Record<Doc["lang"], string[]> = {
  ko: [
    "본 계약에 명시되지 아니한 사항은 관계 법령 및 일반 관례에 따른다.",
    "본 계약과 관련한 분쟁은 갑의 주소지 관할 법원을 제1심 관할 법원으로 한다.",
    "을은 본 계약의 내용을 충분히 읽고 이해하였으며, 이에 자유로운 의사로 서명한다.",
    "본 계약을 증명하기 위하여 계약서 2통을 작성하고 각 1통씩 보관한다.",
    "갑은 필요한 경우 본 계약의 내용을 변경할 수 있으며, 을은 이에 동의한 것으로 본다.",
  ],
  en: [
    "This Agreement constitutes the entire agreement between the parties and supersedes all prior understandings.",
    "If any provision is held unenforceable, the remaining provisions shall remain in full force and effect.",
    "The undersigned acknowledges having read and understood this document and signs it voluntarily.",
    "This Agreement shall be governed by the laws of the jurisdiction chosen by the Company.",
    "No waiver of any term shall be deemed a further or continuing waiver of that or any other term.",
  ],
  ja: ["本契約に定めのない事項は、関係法令及び慣行による。", "本契約に関する紛争は、甲の所在地を管轄する裁判所を専属的合意管轄裁判所とする。", "乙は本契約の内容を十分に理解し、署名する。"],
  de: ["Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.", "Sollte eine Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen wirksam.", "Der Unterzeichnende hat den Vertrag gelesen und verstanden."],
  fr: ["Le présent contrat est régi par le droit français.", "Toute modification fera l'objet d'un avenant écrit.", "Le signataire reconnaît avoir lu et approuvé les présentes."],
};

// The boxes at the top of an official form.
const FIELDS: Record<Doc["lang"], string[]> = {
  ko: ["성명", "생년월일", "주소", "연락처"],
  en: ["Full name", "Date of birth", "Address", "Phone"],
  ja: ["氏名", "生年月日", "住所", "電話"],
  de: ["Name", "Geburtsdatum", "Anschrift", "Telefon"],
  fr: ["Nom", "Date de naissance", "Adresse", "Téléphone"],
};

export type Ink = { path: string; viewBox: string };

export function Document({ doc, ink, number, seconds }: { doc: Doc; ink: Ink; number: number; seconds: number }) {
  return (
    <article className={`${styles.page} ${styles[doc.kind]}`} lang={doc.lang}>
      <header className={styles.issuer}>
        <span>{doc.issuer}</span>
        <span>No. {String(2026000 + number * 37)}</span>
      </header>
      <h1 className={styles.title}>{doc.title}</h1>

      {doc.kind === "form" && (
        <div className={styles.fields}>
          {FIELDS[doc.lang].map((label) => (
            <div key={label} className={styles.field}>
              <span>{label}</span>
              <span />
            </div>
          ))}
        </div>
      )}

      <ol className={styles.clauses}>
        {doc.clauses.map((clause) => (
          <li key={clause}>{clause}</li>
        ))}
        {doc.kind !== "receipt" && doc.kind !== "screen" && SMALL_PRINT[doc.lang].map((line) => <li key={line}>{line}</li>)}
      </ol>

      <footer className={styles.signing}>
        <span className={styles.date}>2026. 11. 12.</span>
        <div className={styles.signBox}>
          <span className={styles.signLabel}>{doc.sign}</span>
          {/* The signature writes itself: pathLength makes the whole path "1 long", and the CSS animation uncovers it. */}
          <svg viewBox={ink.viewBox} className={styles.signature}>
            <path d={ink.path} pathLength={1} className={styles.ink} style={{ animationDuration: `${seconds}s` }} />
          </svg>
        </div>
      </footer>
    </article>
  );
}
