import { google } from "googleapis";

export function getGoogleSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_XIAMEN_SHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!spreadsheetId) {
    throw new Error("GOOGLE_XIAMEN_SHEET_ID가 설정되지 않았습니다.");
  }

  if (!email) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL이 설정되지 않았습니다.");
  }

  if (!privateKey) {
    throw new Error("GOOGLE_PRIVATE_KEY가 설정되지 않았습니다.");
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  return {
    sheets,
    spreadsheetId,
  };
}
