// See https://docs.google.com/spreadsheets/d/10KEd5jJcZGEqIVt3bYZd0hRAK1Bmm8K3N2oLIsKVwdQ
import { GoogleSpreadsheet } from "google-spreadsheet";
import { OPERATIONS_ACCOUNT, PARKING_ACCOUNT } from "./constants";

const sheetId = "10KEd5jJcZGEqIVt3bYZd0hRAK1Bmm8K3N2oLIsKVwdQ";

const getBankAccounts = async () => {
  const values: string[] = [OPERATIONS_ACCOUNT, PARKING_ACCOUNT];

  const doc = new GoogleSpreadsheet(sheetId);
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL as string;

  await doc.useServiceAccountAuth({
    client_email: email,
    private_key: key.replace(/\\n/g, "\n"),
  });
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const rowCount = sheet.rowCount;
  await sheet.loadCells(`C1:C${rowCount}`);

  for (var i = 1; i <= rowCount; i++) {
    const cell = sheet.getCellByA1(`C${i}`);
    if (!!cell.value) {
      values.push(cell.value.toString());
    }
  }

  return values;
};

export default getBankAccounts;
