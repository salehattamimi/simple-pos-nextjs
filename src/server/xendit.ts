import { PaymentMethod, PaymentRequest } from 'xendit-node';
import { addMinutes } from 'date-fns';

export const xenditPaymentRequestClient = new PaymentRequest({
    secretKey: process.env.XENDIT_MONEY_IN_KEY!,
});

export const xenditPyamentMethodClient = new PaymentMethod({
    secretKey: process.env.XENDIT_MONEY_IN_KEY!,
})

type createQrisParam = {
    amount: number;
    orderId: string;
    expiredAt?: Date;
}
export const createQRIS = async (params: createQrisParam) => {
    const paymentRequest = await xenditPaymentRequestClient.createPaymentRequest({
        data: {
            currency: "IDR",
            amount: params.amount,
            referenceId: params.orderId, //ID ORDER DATABASE KITA
            paymentMethod: {
                reusability: "ONE_TIME_USE",
                type: "QR_CODE",
                qrCode: {
                    channelCode: "DANA",
                    channelProperties: {
                        expiresAt: params.expiredAt ?? addMinutes(new Date(), 15),
                    }
                },
                referenceId: params.orderId
            }
        }
    });

    // return paymentRequest.paymentMethod.qrCode?.channelProperties?.qrString;
    return paymentRequest;
}