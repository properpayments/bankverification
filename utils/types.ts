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

export type PapaParseResult = { [key: string]: string };

export type Account = string;

export type MessageName =
  | "missing-virtual-account"
  | "account-not-in-approved-list"
  | "fee-wrong-account"
  | "fee-missing-corresponsing-payout"
  | "is-parking-account";

export type Message = {
  id: string;
  name: MessageName;
  type: "error" | "warning";
};
