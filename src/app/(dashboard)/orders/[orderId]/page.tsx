import { OrderDetail } from "@/features/orders/components/OrderDetail";




export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <OrderDetail orderId={parseInt(orderId)} />
            </div>
          </div>
        </div>
        </>
  );
}
