import { object, z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createQRIS, xenditPyamentMethodClient } from "@/server/xendit";
import { TRPCError } from "@trpc/server";
import { OrderStatus, Prisma } from "@prisma/client";

export const orderRouter = createTRPCRouter({
    createOrder: protectedProcedure.input(
        z.object({
            orderItems: z.array(z.object({
                productId: z.string(),
                quantity: z.coerce.number().min(1),
            }))
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx;
        const { orderItems } = input;

        // DATA REAL PRODUCT DARI DB YG KITA ADD TO CART
        const products = await db.product.findMany({
            where: {
                id: {
                    in: orderItems.map((item) => item.productId)
                }
            }
        })
        let subTotal = 0
        products.forEach(product => {
            const productQuantity = orderItems.find(item => item.productId === product.id)!.quantity;
            // ini dilooping dulu productsnya yang dari where in tadi lalu di cari jika order.productId = product.id maka productQuantity = order.quantity
            // note : tanda seru (!) itu untuk meyakinkan bahwa dia pasti tidak null, jika pake tanda tanya maka possibly undefined
            const totalPrice = product.price * productQuantity;
            subTotal += totalPrice;
        })

        const tax = subTotal * 0.1;

        const grandTotal = subTotal + tax;
        const order = await db.order.create({
            data: {
                subTotal: subTotal,
                grandTotal: grandTotal,
                tax: tax
            }
        });

        const newOrderItems = await db.orderItem.createMany({
            data: products.map(product => {
                const productQuantity = orderItems.find(item => item.productId === product.id)!.quantity;
                return {
                    orderId: order.id,
                    price: product.price,
                    productId: product.id,
                    quantity: productQuantity,
                }
            })
        });

        // ini ambil data dari xenditnya
        const paymentRequest = await createQRIS({
            amount: grandTotal,
            orderId: order.id,
        })

        // lalu update externalTransactionId dan paymentMethod id dari xendit

        await db.order.update({
            where: {
                id: order.id
            },
            data: {
                externalTransactionId: paymentRequest.id,
                paymentMethodId: paymentRequest.paymentMethod.id,
            }
        })

        return {
            order,
            newOrderItems,
            qrString: paymentRequest.paymentMethod.qrCode?.channelProperties?.qrString
        }
    }),

    simulatePayment: protectedProcedure.input(
        z.object({
            orderId: z.string().uuid(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx;

        const order = await db.order.findUnique({
            where: {
                id: input.orderId,
            },
            select: {
                paymentMethodId: true,
                grandTotal: true,
            }
        })
        if (!order) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Order Not Found"
            })
        }

        await xenditPyamentMethodClient.simulatePayment({
            paymentMethodId: order.paymentMethodId!,
            data: {
                amount: order.grandTotal
            }
        })


    }),

    checkOrderStatusPayment: protectedProcedure.input(
        z.object({
            orderId: z.string().uuid()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx;
        const order = await db.order.findUnique({
            where: {
                id: input.orderId
            },
            select: {
                paidAt: true,
                status: true,
            }
        })

        if (!order?.paidAt) {
            return false;
        }

        return true;
    }),

    getOrder: protectedProcedure.input(
        z.object({
            status: z.enum(["all", ...Object.keys(OrderStatus)]).default("all")
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx;
        const whereClause: Prisma.OrderWhereInput = {};

        switch (input.status) {
            case OrderStatus.AWAITING_PAYMENT:
                whereClause.status = OrderStatus.AWAITING_PAYMENT;
                break;
            case OrderStatus.PROCESSING:
                whereClause.status = OrderStatus.PROCESSING;
                break;
            case OrderStatus.DONE:
                whereClause.status = OrderStatus.DONE;
                break;
        }
        const orders = await db.order.findMany({
            where: whereClause,
            select: {
                id: true,
                grandTotal: true,
                status: true,
                paidAt: true,
                _count: {
                    select: {
                        orderItems: true,
                    }
                }
            }
        });
        return orders;
    }),
})