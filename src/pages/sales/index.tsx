import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { OrderCard, type Order } from "@/components/OrderCard";
import type { NextPageWithLayout } from "../_app";
import type { ReactElement } from "react";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatus } from "@prisma/client";
import { api } from "@/utils/api";

const SalesPage: NextPageWithLayout = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const [filterOrders, setFilterOrders] = useState<OrderStatus | "all">("all");


  const handleFinishOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: "Finished" as const }
          : order
      )
    );
  };

  const filterStatus = (value: OrderStatus | "all") => {
    setFilterOrders(value);
    if (value !== "all") {

    }
  }

  const { data: getOrder } = api.order.getOrder.useQuery({
    status: filterOrders
  });


  return (
    <>
      <DashboardHeader>
        <DashboardTitle>Sales Dashboard</DashboardTitle>
        <DashboardDescription>
          Track your sales performance and view analytics.
        </DashboardDescription>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">$0.00</p>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">Ongoing Orders</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">Completed Orders</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Orders</h3>
        <div className="mb-4 flex width-full justify-end">
          <Select onValueChange={filterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="-- Status --" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem key="all" value="all">All</SelectItem>
                {
                  Object.keys(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getOrder?.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              totalAmount={order.grandTotal}
              status={order.status}
              totalItems={order._count.orderItems}
              onFinishOrder={handleFinishOrder}
            />
          ))}
        </div>
      </div>
    </>
  );
};

SalesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SalesPage; 