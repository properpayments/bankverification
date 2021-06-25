import { PapaParseResult, Payment } from "~types";

const validIBANPattern =
  /^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$/;

export function getRecipientAccount(account: any) {
  if (validIBANPattern.test(account)) {
    return account;
  }

  let [reg, bban] = account.split(" ");

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

  return payments;
}

export default getPayments;
