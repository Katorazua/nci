export type CourtPhrase = {
  id: string;
  category: string;
  english: string;
  pidgin: string;
  note?: string;
};

export const courtPhrases: CourtPhrase[] = [
  { id: "court-001", category: "Courtroom instructions", english: "Please take your seat.", pidgin: "Abeg, make you sit down." },
  { id: "court-002", category: "Courtroom instructions", english: "All rise for the court hearing.", pidgin: "Everybody stand up for the court hearing." },
  { id: "court-003", category: "Courtroom instructions", english: "Please stand while the court is in session.", pidgin: "Abeg, make you stand as court dey sit." },
  { id: "court-004", category: "Courtroom instructions", english: "Please speak clearly.", pidgin: "Abeg, make you talk clear-clear." },
  { id: "court-005", category: "Courtroom instructions", english: "Please speak one at a time.", pidgin: "Abeg, make una talk one person at a time." },
  { id: "court-006", category: "Courtroom instructions", english: "Please wait for your turn to speak.", pidgin: "Abeg, wait make e reach your turn before you talk." },
  { id: "court-007", category: "Courtroom instructions", english: "Please listen carefully to the instructions.", pidgin: "Abeg, listen well-well to the instructions." },
  { id: "court-008", category: "Courtroom instructions", english: "Please remain quiet in the courtroom.", pidgin: "Abeg, make una keep quiet inside the courtroom." },
  { id: "court-009", category: "Courtroom instructions", english: "Please switch off your mobile phone.", pidgin: "Abeg, switch off your mobile phone." },
  { id: "court-010", category: "Courtroom instructions", english: "Do not interrupt the speaker.", pidgin: "No interrupt the person wey dey talk." },
  { id: "court-011", category: "Courtroom instructions", english: "Please come forward.", pidgin: "Abeg, come front." },
  { id: "court-012", category: "Courtroom instructions", english: "Please wait outside the courtroom.", pidgin: "Abeg, wait outside the courtroom." },
  { id: "court-013", category: "Court proceedings", english: "The court is now in session.", pidgin: "Court don start to sit now." },
  { id: "court-014", category: "Court proceedings", english: "The hearing will start by 9 o'clock.", pidgin: "The hearing go start by 9 o'clock.", note: "Pidgin wording follows the user's text example; confirm dates and times before use." },
  { id: "court-015", category: "Court proceedings", english: "The judge will hear your case.", pidgin: "The judge go hear your case." },
  { id: "court-016", category: "Court proceedings", english: "The court will hear from both sides.", pidgin: "Court go hear wetin both sides get to talk." },
  { id: "court-017", category: "Court proceedings", english: "The hearing has been adjourned until the stated date.", pidgin: "Court don move the hearing go the date wey dem talk." },
  { id: "court-018", category: "Court proceedings", english: "The court will adjourn until tomorrow.", pidgin: "Court go continue tomorrow." },
  { id: "court-019", category: "Court proceedings", english: "The case will continue on the next hearing date.", pidgin: "The case go continue on the next hearing date." },
  { id: "court-020", category: "Court proceedings", english: "The court is taking a short break.", pidgin: "Court dey take small break." },
  { id: "court-021", category: "Court proceedings", english: "The hearing is finished for today.", pidgin: "The hearing don finish for today." },
  { id: "court-022", category: "Addressing the judge", english: "Please address the judge as Your Honour.", pidgin: "Abeg, call the judge Your Honour." },
  { id: "court-023", category: "Addressing the judge", english: "Please answer the judge's question.", pidgin: "Abeg, answer the judge question." },
  { id: "court-024", category: "Addressing the judge", english: "The judge is listening to you.", pidgin: "The judge dey listen to you." },
  { id: "court-025", category: "Addressing the judge", english: "Please wait for the judge to speak.", pidgin: "Abeg, wait make the judge talk first." },
  { id: "court-026", category: "Witness instructions", english: "Please tell the truth.", pidgin: "Abeg, make you talk the truth." },
  { id: "court-027", category: "Witness instructions", english: "Please raise your right hand.", pidgin: "Abeg, raise your right hand." },
  { id: "court-028", category: "Witness instructions", english: "Please repeat your answer.", pidgin: "Abeg, make you talk your answer again." },
  { id: "court-029", category: "Witness instructions", english: "Do you understand the question?", pidgin: "You understand the question?" },
  { id: "court-030", category: "Witness instructions", english: "Answer only the question that was asked.", pidgin: "Answer only the question wey dem ask you." },
  { id: "court-031", category: "Witness instructions", english: "If you do not understand, please say so.", pidgin: "If you no understand, abeg talk am." },
  { id: "court-032", category: "Witness instructions", english: "Please do not guess.", pidgin: "Abeg, no guess." },
  { id: "court-033", category: "Questions and responses", english: "Can you hear me clearly?", pidgin: "You fit hear me clear?" },
  { id: "court-034", category: "Questions and responses", english: "Please answer yes or no.", pidgin: "Abeg, answer yes or no." },
  { id: "court-035", category: "Questions and responses", english: "When did this happen?", pidgin: "When this thing happen?" },
  { id: "court-036", category: "Questions and responses", english: "Where were you at that time?", pidgin: "Where you dey at that time?" },
  { id: "court-037", category: "Hearing dates and times", english: "Please return to court on Monday at 9:00 AM.", pidgin: "Abeg, come back to court on Monday by 9:00 AM." },
  { id: "court-038", category: "Hearing dates and times", english: "The next hearing is on 15 June at 10:30 AM.", pidgin: "The next hearing na 15 June by 10:30 AM." },
  { id: "court-039", category: "Document submission", english: "Please submit the required documents.", pidgin: "Abeg, submit the documents wey dem ask for." },
  { id: "court-040", category: "Document submission", english: "Please bring the original document and one copy.", pidgin: "Abeg, bring the original document and one copy." },
];

export function normalizePhrase(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export function findCourtPhrase(text: string): CourtPhrase | undefined {
  const normalized = normalizePhrase(text);
  return courtPhrases.find((phrase) => normalizePhrase(phrase.english) === normalized);
}
