import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";

const sheetId = "10KEd5jJcZGEqIVt3bYZd0hRAK1Bmm8K3N2oLIsKVwdQ";

const getApprovedAccounts = async () => {
  const values: string[] = [];

  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(
    /\\n/gm,
    "\n"
  ).replace(/^"|"$/g, "");

  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const doc = new GoogleSpreadsheet(sheetId, authClient);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const rowCount = sheet.rowCount;
  await sheet.loadCells(`C1:C${rowCount}`);

  for (let i = 1; i <= rowCount; i++) {
    const cell = sheet.getCellByA1(`C${i}`);
    if (cell.value) {
      values.push(cell.value.toString());
    }
  }

  return values;
};

export default getApprovedAccounts;
