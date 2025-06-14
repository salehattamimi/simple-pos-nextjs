import { Button } from "@/components/ui/button";
import { toRupiah } from "@/utils/toRupiah";
import { OrderStatus } from "@prisma/client";

export interface Order {
  id: string;
  totalAmount: number;
  totalItems: number;
  status: "Processing" | "Finished";
}

interface OrderCardProps {
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  onFinishOrder?: (orderId: string) => void;
}

export const OrderCard = ({ id, totalAmount, totalItems, status, onFinishOrder }: OrderCardProps) => {
  const handleFinishOrder = () => {
    if (onFinishOrder) {
      onFinishOrder(id);
    }
  };

  const getBatchColor = () => {
    switch (status) {
      case OrderStatus.AWAITING_PAYMENT:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.PROCESSING:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.DONE:
        return "bg-green-100 text-green-800";
    }
  }

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="mb-3 flex flex-col items-start justify-between">
        <div>
          <h4 className="text-muted-foreground text-sm font-medium">
            Order ID
          </h4>
          <p className="font-mono text-sm mb-3">{id}</p>
        </div>
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${getBatchColor()}`}
        >
          {status}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Amount
          </h4>
          <p className="text-lg font-bold">${toRupiah(totalAmount)}</p>
        </div>
        <div>
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Items
          </h4>
          <p className="text-lg font-bold">{totalItems}</p>
        </div>
      </div>

      {
        OrderStatus.PROCESSING && (
          <Button onClick={handleFinishOrder} className="w-full" size="sm">
            Finish Order
          </Button>
        )
      }
    </div >
  );
};
