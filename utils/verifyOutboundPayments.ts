import type { Account, Message, PapaParseResult, Payment } from "./types";

import { OPERATIONS_ACCOUNT, PARKING_ACCOUNT } from "./constants";
import getPayments from "./getPayments";

function senderIsVirtualAccount(payment: Payment) {
  return (
    payment["Afsenders konto"] === "Payments, virtuel" ||
    payment["Afsenders konto"] === "Payments, virtual EUR"
  );
}

function toAccountIsInApprovedAccounts(payment: Payment, accounts: Account[]) {
  return accounts.find((account) => account === payment["Modtagers konto"]);
}

function isProperFee(payment: Payment) {
  return !!payment["Tekst"].match("fees");
}

function toAccountIsOperationsAccount(payment: Payment) {
  return payment["Modtagers konto"] === OPERATIONS_ACCOUNT;
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
  accounts: Account[]
) {
  const messages: Message[] = [];
  const payments = getPayments(papaParseResult);

  payments.forEach((payment) => {
    const id = payment.Tekst;
    if (!senderIsVirtualAccount(payment)) {
      messages.push({ id, name: "missing-virtual-account", type: "error" });
    }

    if (!toAccountIsInApprovedAccounts(payment, accounts)) {
      messages.push({
        id,
        name: "account-not-in-approved-list",
        type: "error",
      });
    }

    if (isProperFee(payment)) {
      if (!toAccountIsOperationsAccount(payment)) {
        messages.push({ id, name: "fee-wrong-account", type: "error" });
      }

      if (!feeHasCorrespondingPayout(payment, payments)) {
        messages.push({
          id,
          name: "fee-missing-corresponsing-payout",
          type: "error",
        });
      }
    }

    if (toAccountIsParkingAccount(payment)) {
      messages.push({ id, name: "is-parking-account", type: "warning" });
    }
  });

  return messages;
}

export default verifyOutboundPayments;
