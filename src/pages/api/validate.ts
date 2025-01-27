import type { NextApiRequest, NextApiResponse } from "next";
import getApprovedAccounts from "~utils/getApprovedAccounts";
import { Message } from "~types";
import verifyOutboundPayments from "~utils/verifyOutboundPayments";

type Response = Message[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") {
    return res.status(405).json([
      {
        id: "method-not-allowed",
        code: "missing-virtual-account",
        type: "error",
      },
    ]);
  }

  try {
    const accounts = await getApprovedAccounts();
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const messages = verifyOutboundPayments(data, accounts);
    res.status(200).json(messages);
  } catch (error) {
    console.error("API Error:", error);
    res
      .status(500)
      .json([
        { id: "server-error", code: "missing-virtual-account", type: "error" },
      ]);
  }
}
