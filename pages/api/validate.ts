import type { NextApiRequest, NextApiResponse } from "next";
import getPayments from "../../utils/getPayments";
import { Payment } from "../../utils/types";

type Reponse = Payment[];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reponse>
) {
  const body = JSON.parse(req.body);
  const payments = getPayments(body);
  res.status(200).json(payments);
}
