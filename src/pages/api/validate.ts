import type { NextApiRequest, NextApiResponse } from "next";
import getApprovedAccounts from "~utils/getApprovedAccounts";
import { Message } from "~types";
import verifyOutboundPayments from "~utils/verifyOutboundPayments";

type Reponse = Message[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reponse>
) {
  const accounts = await getApprovedAccounts();
  const papaParseResults = JSON.parse(req.body);
  const messages = verifyOutboundPayments(papaParseResults, accounts);
  res.status(200).json(messages);
}
