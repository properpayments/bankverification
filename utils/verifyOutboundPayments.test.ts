import verifyOutboundPayments from "./verifyOutboundPayments";

import fs from "fs";
import path from "path";

import { parseString } from "./parseCSV";

const getMock = (pathName: string) => {
  const filePath = path.join(__dirname, pathName);
  const csvFile = fs.readFileSync(filePath);
  return csvFile.toString();
};

const approvedAccounts = ["00000012345678", "00001111111111"];

describe("verifyOutboundPayments", () => {
  it("it crashes for malformed payments CSV file", () => {
    const mock = getMock("./mocks/payments_malformed.csv");
    const data = parseString(mock);
    const messages = verifyOutboundPayments(data, approvedAccounts);
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
    const messages = verifyOutboundPayments(data, approvedAccounts);
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
      {
        code: "account-not-in-approved-list",
        id: "Proper pqr",
        type: "error",
      },
    ]);
  });
  it("it returns no errors if everything is good", async () => {
    const mock = getMock("./mocks/payments_with_no_errors.csv");
    const data = parseString(mock);
    const messages = verifyOutboundPayments(data, approvedAccounts);
    expect(messages).toEqual([
      {
        code: "is-parking-account",
        id: "Proper def",
        type: "warning",
      },
    ]);
  });
});
