import type {
  Account,
  Message,
  PapaParseResult,
  Payment,
  PaymentKey,
} from "./types";

import {
  PROPER_OPERATION_ACCOUNTS,
  PARKING_ACCOUNT,
  OPERATIONS_ACCOUNT_DKK,
  OPERATIONS_ACCOUNT_EUR,
} from "../constants";
import getPayments from "./getPayments";

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

function hasValidFileFormat(payment: Payment) {
  let isValid = true;

  Object.keys(payment).forEach((key) => {
    if (!EXPECTED_PAYMENT_KEYS.includes(key as PaymentKey)) {
      console.error(new Error(`Unexpected key "${key}"`));
      isValid = false;
    }
  });

  return isValid;
}

function senderIsVirtualAccount(payment: Payment) {
  return (
    payment["Afsenders konto"] === "Payments, virtuel" ||
    payment["Afsenders konto"] === "Payments, virtual EUR"
  );
}

function toAccountIsInApprovedAccounts(
  payment: Payment,
  approvedAccounts: Account[]
) {
  return approvedAccounts.find(
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

  if (!hasValidFileFormat(payments[0])) {
    return [{ id: "", code: "invalid-file-format", type: "error" }];
  }

  const messages: Message[] = [];
  payments.forEach((payment) => {
    const id = payment.Tekst;
    if (!senderIsVirtualAccount(payment)) {
      messages.push({ id, code: "missing-virtual-account", type: "error" });
    }

    if (!toAccountIsInApprovedAccounts(payment, approvedAccounts)) {
      messages.push({
        id,
        code: "account-not-in-approved-list",
        type: "error",
      });
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
    }

    if (toAccountIsParkingAccount(payment)) {
      messages.push({ id, code: "is-parking-account", type: "warning" });
    }
  });

  return messages;
}

export default verifyOutboundPayments;
