// The 40 things one signature ends up on. Everyday papers first, then heavier ones.
// kind = how the page looks: "form" (a ruled official form), "legal" (dense serif contract),
// "screen" (an app's consent screen), "receipt" (a narrow slip).
export type Doc = {
  kind: "form" | "legal" | "screen" | "receipt";
  lang: "ko" | "en" | "ja" | "de" | "fr";
  issuer: string; // small line at the top
  title: string;
  clauses: string[]; // the lines that make this document this document
  sign: string; // label next to the signature line
};

export const DOCUMENTS: Doc[] = [
  { kind: "receipt", lang: "ko", issuer: "CJ대한통운", title: "택배 수령 확인", clauses: ["상기 물품을 이상 없이 수령하였음을 확인합니다.", "수령 후 파손·분실에 대한 책임은 수령인에게 있습니다."], sign: "수령인 (서명)" },
  { kind: "receipt", lang: "ko", issuer: "신용카드 매출전표", title: "카드 결제 승인", clauses: ["일시불 47,300원", "위 금액을 카드사 회원약관에 따라 지급하겠습니다."], sign: "회원 서명" },
  { kind: "screen", lang: "en", issuer: "Software Update", title: "Terms and Conditions", clauses: ["By tapping Agree you accept all 14,382 words of these terms.", "We may change these terms at any time without telling you.", "You have read and understood this agreement."], sign: "I agree" },
  { kind: "screen", lang: "ko", issuer: "회원가입", title: "개인정보 수집·이용 동의", clauses: ["[필수] 개인정보 수집 및 이용에 동의합니다.", "[필수] 개인정보의 제3자 제공에 동의합니다.", "[선택] 마케팅 정보 수신에 동의합니다. (미동의 시 가입 불가)"], sign: "전체 동의" },
  { kind: "form", lang: "ko", issuer: "통신사 대리점", title: "휴대폰 할부매매 약정서", clauses: ["약정 기간 24개월, 중도 해지 시 위약금이 청구됩니다.", "할부원금 1,540,000원, 할부수수료 연 5.9%", "부가서비스 3개월 유지 조건에 동의합니다."], sign: "가입자 (인)" },
  { kind: "form", lang: "ko", issuer: "피트니스 센터", title: "회원 이용 계약서", clauses: ["12개월 등록, 중도 환불은 정상가 기준으로 공제합니다.", "시설 이용 중 발생한 부상에 대해 센터는 책임지지 않습니다."], sign: "회원 (서명)" },
  { kind: "legal", lang: "en", issuer: "Adventure Park, LLC", title: "Liability Waiver and Release", clauses: ["I assume all risks, known and unknown, including serious injury and death.", "I release the Company from any and all claims, forever.", "This waiver binds my heirs and my estate."], sign: "Participant signature" },
  { kind: "form", lang: "ko", issuer: "부동산 중개사무소", title: "부동산 임대차 계약서", clauses: ["보증금 금 이억오천만 원정, 월 차임 금 구십만 원정", "임차인은 계약 종료 시 목적물을 원상으로 회복하여 반환한다.", "차임을 2기 이상 연체할 경우 임대인은 계약을 해지할 수 있다."], sign: "임차인 (인)" },
  { kind: "legal", lang: "en", issuer: "State of California", title: "Residential Lease Agreement", clauses: ["Tenant shall pay rent of $3,450 on the first day of each month.", "Landlord may enter the premises with 24 hours' notice.", "The security deposit may be withheld for any damage beyond ordinary wear."], sign: "Tenant" },
  { kind: "legal", lang: "de", issuer: "Wohnungsgesellschaft mbH", title: "Mietvertrag", clauses: ["Die Miete beträgt monatlich 1.280,00 EUR zuzüglich Nebenkosten.", "Schönheitsreparaturen trägt der Mieter.", "Die Kündigungsfrist beträgt drei Monate."], sign: "Mieter" },
  { kind: "form", lang: "ko", issuer: "고용노동부 표준 양식", title: "표준 근로계약서", clauses: ["근로계약기간: 2026년 12월 1일부터 2027년 11월 30일까지", "소정근로시간: 09시 00분부터 18시 00분까지 (휴게시간 1시간)", "임금: 시간급 10,320원, 연장근로는 포괄하여 산정한다."], sign: "근로자 (서명)" },
  { kind: "legal", lang: "en", issuer: "Human Resources", title: "At-Will Employment Agreement", clauses: ["Employment may be terminated at any time, with or without cause, with or without notice.", "All work product belongs to the Company, including work made outside working hours.", "Employee waives the right to a jury trial."], sign: "Employee" },
  { kind: "legal", lang: "fr", issuer: "Société par actions simplifiée", title: "Contrat de travail à durée déterminée", clauses: ["Le présent contrat est conclu pour une durée de six mois.", "La période d'essai est fixée à un mois, renouvelable.", "Le salarié s'engage à une obligation de confidentialité."], sign: "Le salarié" },
  { kind: "form", lang: "ja", issuer: "株式会社", title: "労働契約書", clauses: ["契約期間：期間の定めあり（一年間、更新する場合があり得る）", "時間外労働：業務の都合により命じることがある。", "退職に関する事項は就業規則による。"], sign: "労働者（署名）" },
  { kind: "legal", lang: "en", issuer: "Confidential", title: "Non-Disclosure Agreement", clauses: ["Recipient shall not disclose any information, in any form, for an indefinite period.", "The existence of this agreement is itself confidential.", "Breach entitles the Company to injunctive relief and damages without limit."], sign: "Recipient" },
  { kind: "form", lang: "ko", issuer: "인사팀", title: "비밀유지 및 경업금지 서약서", clauses: ["퇴직 후 2년간 동종 업계에 취업하거나 창업하지 않겠습니다.", "위반 시 회사가 입은 손해 전액과 위약벌 금 일억 원을 배상하겠습니다."], sign: "서약자 (인)" },
  { kind: "legal", lang: "en", issuer: "Dispute Resolution", title: "Mandatory Arbitration Agreement", clauses: ["All disputes shall be resolved by binding arbitration, not in court.", "You waive the right to participate in a class action.", "The arbitrator shall be selected by the Company."], sign: "Signature" },
  { kind: "form", lang: "ko", issuer: "은행 여신거래", title: "대출거래약정서", clauses: ["대출금액 금 삼억 원정, 변동금리 연 5.87%", "기한의 이익을 상실한 때에는 즉시 전액을 변제하여야 한다.", "연체 시 약정이자에 연 3%를 가산한다."], sign: "채무자 (인)" },
  { kind: "form", lang: "ko", issuer: "은행 여신거래", title: "연대보증서", clauses: ["보증인은 채무자가 부담하는 모든 채무를 채무자와 연대하여 이행한다.", "보증한도액 금 삼억구천만 원정", "보증인은 최고·검색의 항변권을 포기한다."], sign: "연대보증인 (인)" },
  { kind: "legal", lang: "en", issuer: "U.S. Department of Education", title: "Master Promissory Note", clauses: ["I promise to pay all loan amounts disbursed, plus interest and fees.", "This debt is generally not dischargeable in bankruptcy.", "Unpaid interest will be capitalized."], sign: "Borrower" },
  { kind: "legal", lang: "en", issuer: "Mortgage Lender", title: "Promissory Note and Deed of Trust", clauses: ["Borrower promises to pay $612,000 over 360 monthly payments.", "If Borrower defaults, Lender may sell the property without court action.", "Borrower waives presentment, notice of dishonor and protest."], sign: "Borrower" },
  { kind: "form", lang: "ko", issuer: "자동차 매매 상사", title: "자동차 양도 증명서", clauses: ["매매대금 금 이천삼백만 원정", "인도 이후 발생하는 모든 하자는 양수인이 부담한다."], sign: "양수인 (인)" },
  { kind: "form", lang: "ko", issuer: "생명보험 주식회사", title: "보험 청약서", clauses: ["계약 전 알릴 의무를 위반한 경우 보험금 지급이 거절될 수 있습니다.", "약관의 중요한 내용을 설명 듣고 이해하였음을 확인합니다."], sign: "계약자 (자필 서명)" },
  { kind: "form", lang: "ko", issuer: "대학병원", title: "수술·시술 동의서", clauses: ["수술 중 예기치 못한 합병증이 발생할 수 있음을 설명 들었습니다.", "사망 또는 영구적 장애의 가능성에 대하여 설명 들었습니다.", "위 내용을 이해하고 수술에 동의합니다."], sign: "환자 또는 대리인 (서명)" },
  { kind: "legal", lang: "en", issuer: "General Hospital", title: "Consent to Treatment", clauses: ["I consent to any procedure my physicians judge necessary.", "No guarantee has been made as to the result.", "I am financially responsible for all charges not covered by insurance."], sign: "Patient or representative" },
  { kind: "form", lang: "en", issuer: "Physician Orders", title: "Do Not Resuscitate Order", clauses: ["In the event of cardiac or respiratory arrest, no resuscitation shall be attempted.", "I understand this decision and its consequences."], sign: "Patient" },
  { kind: "form", lang: "ko", issuer: "방송 제작사", title: "초상권 사용 동의서", clauses: ["촬영된 영상 및 음성을 기간과 매체의 제한 없이 사용하는 데 동의합니다.", "편집 방향에 대하여 일체의 이의를 제기하지 않겠습니다."], sign: "출연자 (서명)" },
  { kind: "legal", lang: "en", issuer: "Talent Agency", title: "Model Release", clauses: ["I grant the irrevocable right to use my likeness in all media, now known or later invented, throughout the universe, in perpetuity.", "I waive any right to inspect or approve the finished work."], sign: "Model" },
  { kind: "legal", lang: "en", issuer: "Family Law", title: "Prenuptial Agreement", clauses: ["Each party waives all claims to the separate property of the other.", "In the event of dissolution, neither party shall seek support."], sign: "Party" },
  { kind: "form", lang: "ko", issuer: "가족관계등록", title: "혼인신고서", clauses: ["위와 같이 혼인하였음을 신고합니다.", "성·본의 협의: 자녀의 성·본을 모의 성·본으로 하는 협의를 하지 않았습니다."], sign: "신고인 (서명 또는 날인)" },
  { kind: "form", lang: "ko", issuer: "주식회사", title: "퇴직 합의서", clauses: ["본 합의금 수령 후 회사에 대하여 민·형사상 일체의 이의를 제기하지 않는다.", "본 합의의 내용을 제3자에게 누설하지 않는다."], sign: "퇴직자 (인)" },
  { kind: "screen", lang: "en", issuer: "Gig Platform", title: "Independent Contractor Agreement", clauses: ["You are not an employee.", "The Platform may deactivate your account at its sole discretion.", "Tap to accept and start earning."], sign: "Accept" },
  { kind: "screen", lang: "en", issuer: "Cookie Preferences", title: "We value your privacy", clauses: ["We and our 1,417 partners store and access information on your device.", "Your data may be used to build a profile of you."], sign: "Accept all" },
  { kind: "legal", lang: "en", issuer: "European Union", title: "Consent to Data Processing", clauses: ["I consent to the processing of my biometric data for the stated purposes.", "The data may be transferred to third countries."], sign: "Data subject" },
  { kind: "legal", lang: "en", issuer: "Durable", title: "General Power of Attorney", clauses: ["I appoint my Agent to act for me in all matters, as fully as I could do in person.", "This power shall not be affected by my subsequent incapacity."], sign: "Principal" },
  { kind: "form", lang: "en", issuer: "Armed Forces", title: "Enlistment Contract", clauses: ["I may be ordered to active duty in time of war for its entire duration.", "Laws and regulations that govern military personnel may change without notice to me."], sign: "Enlistee" },
  { kind: "form", lang: "ko", issuer: "전속계약", title: "연습생 전속 계약서", clauses: ["계약기간은 데뷔일로부터 7년으로 한다.", "교육·숙식 비용 일체는 향후 정산금에서 우선 공제한다.", "사생활은 회사의 관리 지침에 따른다."], sign: "연습생 및 법정대리인 (인)" },
  { kind: "legal", lang: "en", issuer: "Settlement", title: "Release of All Claims, Known and Unknown", clauses: ["I give up every claim I have, and every claim I do not yet know I have.", "I will never speak of this matter again."], sign: "Releasor" },
  { kind: "form", lang: "ko", issuer: "사채", title: "신체포기각서", clauses: ["기한 내에 채무를 변제하지 못할 경우, 본인의 신체에 관한 일체의 권리를 채권자에게 양도합니다.", "이에 대하여 민·형사상 어떠한 이의도 제기하지 않겠습니다."], sign: "채무자 (지장)" },
  { kind: "legal", lang: "en", issuer: "Last page", title: "Last Will and Testament", clauses: ["I, being of sound mind, declare this to be my last will.", "I give all that I own to the parties named in the documents above."], sign: "Testator" },
];
