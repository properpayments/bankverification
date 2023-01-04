import { PapaParseResult, Payment, PaymentKey } from "~types";

const EXPECTED_PAYMENT_KEYS: PaymentKey[] = [
  "Beløb",
  "Valuta",
  "Dato",
  "Afsenders konto",
  "Tekst",
  "Modtagers navn",
  "Modtagers konto",
  "Betalingstype",
  "Status",
];

function validateFileFormat(payment: Payment) {
  Object.keys(payment).forEach((key) => {
    if (!EXPECTED_PAYMENT_KEYS.includes(key as PaymentKey)) {
      throw new Error(`Unexpected key "${key}"`);
    }
  });
}

const validIBANPattern =
  /^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$/;

export function getRecipientAccount(account: any) {
  let _account = account.replaceAll(" ", ""); // Remove space from human-formatted IBANs like "DK12 3456 7890 1234 56"

  if (validIBANPattern.test(_account)) {
    return _account;
  }

  let [reg, bban] = [_account.slice(0, 4), _account.slice(4)];

  while (bban.length < 10) {
    bban = `0${bban}`;
  }

  return `${reg}${bban}`.trim();
}

function getPayments(papaParseResults: PapaParseResult[]): Payment[] {
  const payments: Payment[] = [];

  papaParseResults.map((obj) => {
    const keys = Object.keys(obj);
    let object: any = {};

    keys.forEach((key) => {
      const property = key.trim();
      let value = obj[key].trim();
      if (property === "Modtagers konto") {
        value = getRecipientAccount(value);
      }
      object[property] = value;
    });

    payments.push(object);
  });

  validateFileFormat(payments[0]);
  return payments;
}

export default getPayments;
