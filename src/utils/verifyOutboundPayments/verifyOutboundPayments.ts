import type { Account, Message, PapaParseResult, Payment } from "~types";

import {
  PROPER_OPERATION_ACCOUNTS,
  PARKING_ACCOUNT,
  OPERATIONS_ACCOUNT_DKK,
  OPERATIONS_ACCOUNT_EUR,
} from "~constants";
import getPayments from "./getPayments";

function senderIsValidAccount(payment: Payment) {
  return (
    payment["Afsenders konto"] === "Payments, virtuel" ||
    payment["Afsenders konto"] === "Payments, virtual EUR" ||
    payment["Afsenders konto"] === "Payments, Betalingsservice" ||
    payment["Afsenders konto"] === "Proper, kreditnota" ||
    payment["Afsenders konto"] === "Proper, kreditnota EUR"
  );
}

function toAccountIsInApprovedAccounts(
  payment: Payment,
  approvedAccounts: Account[]
) {
  return [PARKING_ACCOUNT, ...approvedAccounts].find(
    (account) => account === payment["Modtagers konto"]
  );
}

function isProperFee(payment: Payment) {
  return !!payment["Tekst"].match("fees");
}

function toAccountIsOperationsAccount(payment: Payment) {
  return PROPER_OPERATION_ACCOUNTS.find(
    (account) => account === payment["Modtagers konto"]
  );
}

function toAccountAndPaymentHasSameCurrency(payment: Payment) {
  if (payment.Valuta === "EUR") {
    return OPERATIONS_ACCOUNT_EUR === payment["Modtagers konto"];
  }
  return OPERATIONS_ACCOUNT_DKK === payment["Modtagers konto"];
}

function toAccountIsParkingAccount(payment: Payment) {
  return payment["Modtagers konto"] === PARKING_ACCOUNT;
}

function feeHasCorrespondingPayout(payment: Payment, payments: Payment[]) {
  const correspondingPayoutText = payment.Tekst.replace("fees ", "");
  return !!payments.find(({ Tekst }) => Tekst === correspondingPayoutText);
}

function verifyOutboundPayments(
  papaParseResult: PapaParseResult[],
  approvedAccounts: Account[]
): Message[] {
  const payments = getPayments(papaParseResult);

  const messages: Message[] = [];
  payments.forEach((payment) => {
    const id = payment.Tekst;

    if (!senderIsValidAccount(payment)) {
      messages.push({ id, code: "missing-virtual-account", type: "error" });
    }

    if (isProperFee(payment)) {
      if (!toAccountIsOperationsAccount(payment)) {
        messages.push({ id, code: "fee-wrong-account", type: "error" });
      } else if (!toAccountAndPaymentHasSameCurrency(payment)) {
        messages.push({ id, code: "fee-currency-mismatch", type: "error" });
      }

      if (!feeHasCorrespondingPayout(payment, payments)) {
        messages.push({
          id,
          code: "fee-missing-corresponding-payout",
          type: "error",
        });
      }
    } else {
      if (!toAccountIsInApprovedAccounts(payment, approvedAccounts)) {
        messages.push({
          id,
          code: "account-not-in-approved-list",
          type: "error",
        });
      } else if (toAccountIsParkingAccount(payment)) {
        messages.push({ id, code: "is-parking-account", type: "warning" });
      }
    }
  });

  return messages;
}

export default verifyOutboundPayments;
