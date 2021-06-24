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

export type MessageCode =
  | "missing-virtual-account"
  | "account-not-in-approved-list"
  | "fee-wrong-account"
  | "fee-missing-corresponding-payout"
  | "fee-currency-mismatch"
  | "is-parking-account"
  | "invalid-file-format";

export type Message = {
  id: string;
  code: MessageCode;
  type: "error" | "warning";
};
