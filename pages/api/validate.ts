import type { NextApiRequest, NextApiResponse } from "next";
import getBankAccounts from "../../utils/getBankAccounts";
import { Message } from "../../utils/types";
import verifyOutboundPayments from "../../utils/verifyOutboundPayments";

type Reponse = Message[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reponse>
) {
  const accounts = await getBankAccounts();
  const papaParseResults = JSON.parse(req.body);
  const messages = verifyOutboundPayments(papaParseResults, accounts);
  res.status(200).json(messages);
}
