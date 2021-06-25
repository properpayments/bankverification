import { getRecipientAccount } from "./getPayments";

describe("getAccountNumber", () => {
  it("it removes space between reg and account number", () => {
    expect(getRecipientAccount("1234 0012345678")).toEqual("12340012345678");
  });
  it("it adds zeroes to the beginning of account numbers until 10 digits is reached", () => {
    expect(getRecipientAccount("1234 12345678")).toEqual("12340012345678");
  });
  it("it returns IBAN numbers 'as is'", () => {
    expect(getRecipientAccount("DK9520000123456789")).toEqual(
      "DK9520000123456789"
    );
  });
});
