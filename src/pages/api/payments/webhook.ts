import { db } from "@/server/db";
import type { NextApiHandler } from "next";

type XenditWebhookBody = {
    "event": "payment.succeeded",
    "data": {
        "id": string,
        "amount": number,
        "payment_request_id": string,
        "reference_id": string,
        "status": "SUCCEEDED" | "FAILED";
    }
}
const handler: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') return;

    const headers = req.headers;
    const webhookToken = headers["x-callback-token"];

    if (webhookToken !== process.env.XENDIT_WEB_TOKEN) {
        return res.status(401);
    }
    const body = req.body as XenditWebhookBody;

    // process order dibawah sini

    // 1. find order
    // 2. if success, update order to success

    const order = await db.order.findUnique({
        where: {
            id: body.data.reference_id
        }
    })

    if (!order) {
        return res.status(404).send("Order Not Found");
    }

    if (body.data.status !== 'SUCCEEDED') {
        return res.status(422).send("Payment Not Success");
    }

    await db.order.update({
        where: {
            id: order.id
        },
        data: {
            paidAt: new Date(),
            status: "PROCESSING"
        }
    })


    res.status(200);
}
export default handler;