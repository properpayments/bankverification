export type PaymentKey =
  | "Beløb"
  | "Valuta"
  | "Dato"
  | "Afsenders konto"
  | "Tekst"
  | "Modtagers navn"
  | "Modtagers konto"
  | "Betalingstype"
  | "Status";

export type Payment = { [key in PaymentKey]: string };

export type PapaParseResult = { [key: string]: string }[];
