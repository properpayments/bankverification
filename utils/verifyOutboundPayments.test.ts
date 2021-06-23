import verifyOutboundPayments from "./verifyOutboundPayments";

import fs from "fs";
import path from "path";

import { parseString } from "./parseCSV";
import { OPERATIONS_ACCOUNT, PARKING_ACCOUNT } from "./constants";

const getMock = (pathName: string) => {
  const filePath = path.join(__dirname, pathName);
  const csvFile = fs.readFileSync(filePath);
  return csvFile.toString();
};

const accounts = [
  OPERATIONS_ACCOUNT,
  PARKING_ACCOUNT,
  "00000012345678",
  "30010012787812",
];

describe("verifyOutboundPayments", () => {
  it("it crashes for malformed payments CSV file", () => {
    const mock = getMock("./mocks/payments_malformed.csv");
    const data = parseString(mock);
    const t = () => verifyOutboundPayments(data, accounts);
    expect(t).toThrow('Unexpected key "Tkst"');
  });
  it("returns expected messages for unexpected data in the CSV", () => {
    const mock = getMock("./mocks/payments_with_errors.csv");
    const data = parseString(mock);
    const messages = verifyOutboundPayments(data, accounts);
    expect(messages).toEqual([
      {
        id: "Proper abc",
        name: "missing-virtual-account",
        type: "error",
      },
      {
        id: "Proper def",
        name: "account-not-in-approved-list",
        type: "error",
      },
      {
        id: "Proper fees def",
        name: "fee-wrong-account",
        type: "error",
      },
      {
        id: "Proper fees ???",
        name: "fee-missing-corresponsing-payout",
        type: "error",
      },
      {
        id: "Proper ghi",
        name: "is-parking-account",
        type: "warning",
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
