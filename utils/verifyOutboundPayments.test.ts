import verifyOutboundPayments from "./verifyOutboundPayments";

import fs from "fs";
import path from "path";

import { parseString } from "./parseCSV";
import { PROPER_ACCOUNTS } from "../constants";

const getMock = (pathName: string) => {
  const filePath = path.join(__dirname, pathName);
  const csvFile = fs.readFileSync(filePath);
  return csvFile.toString();
};

const accounts = [...PROPER_ACCOUNTS, "00000012345678", "30010012787812"];

describe("verifyOutboundPayments", () => {
  it("it crashes for malformed payments CSV file", () => {
    const mock = getMock("./mocks/payments_malformed.csv");
    const data = parseString(mock);
    const messages = verifyOutboundPayments(data, accounts);
    expect(messages).toEqual([
      {
        id: "",
        code: "invalid-file-format",
        type: "error",
      },
    ]);
  });
  it("returns expected messages for unexpected data in the CSV", () => {
    const mock = getMock("./mocks/payments_with_errors.csv");
    const data = parseString(mock);
    const messages = verifyOutboundPayments(data, accounts);
    expect(messages).toEqual([
      {
        id: "Proper abc",
        code: "missing-virtual-account",
        type: "error",
      },
      {
        id: "Proper def",
        code: "account-not-in-approved-list",
        type: "error",
      },
      {
        id: "Proper fees def",
        code: "fee-wrong-account",
        type: "error",
      },
      {
        id: "Proper fees ???",
        code: "fee-missing-corresponding-payout",
        type: "error",
      },
      {
        id: "Proper ghi",
        code: "is-parking-account",
        type: "warning",
      },
      {
        code: "fee-currency-mismatch",
        id: "Proper fees jkl",
        type: "error",
      },
      {
        code: "fee-currency-mismatch",
        id: "Proper fees mno",
        type: "error",
      },
    ]);
  });
  it("it returns no messages the CSV looks good", async () => {
    const mock = getMock("./mocks/payments.csv");
    const data = parseString(mock);
    const messages = verifyOutboundPayments(data, accounts);
    expect(messages).toEqual([]);
  });
});
