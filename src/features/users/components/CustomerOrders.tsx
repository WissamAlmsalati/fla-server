"use client";

import { useEffect, useState } from "react";
import { Order } from "@/features/orders/slices/orderSlice";
import { fetchOrders } from "@/features/orders/api/ordersService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateCombinedInvoicePDF } from "@/lib/generateCombinedInvoicePDF";
import { toast } from "sonner";

interface CustomerOrdersProps {
  customerId: number;
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصل إلى الصين",
  shipping_to_libya: "جاري الشحن إلى ليبيا",
  arrived_libya: "وصل إلى ليبيا",
  ready_for_pickup: "جاهز للاستلام",
  delivered: "تم التسليم",
};

export function CustomerOrders({ customerId }: CustomerOrdersProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [customerName, setCustomerName] = useState("");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const filters: Record<string, string | number> = { customerId };
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter && statusFilter !== "all") filters.status = statusFilter;
        
        const response = await fetchOrders(filters);
        setOrders(response.data as Order[]);

        // Get customer name from the first order
        if (response.data && response.data.length > 0) {
          const firstOrder = response.data[0] as Order;
          if (firstOrder.customer) {
            setCustomerName(firstOrder.customer.user?.name ?? "");
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId, debouncedSearch, statusFilter]);

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const deliveredOrderIds = paginatedOrders
        .filter(order => order.status === 'delivered')
        .map(order => order.id);
      setSelectedOrders(new Set(deliveredOrderIds));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleGenerateCombinedInvoice = async () => {
    const selectedOrderObjects = orders.filter(order => selectedOrders.has(order.id));
    
    if (selectedOrderObjects.length === 0) {
      toast.error("يرجى اختيار طلب واحد على الأقل");
      return;
    }

    // Check if all selected orders are delivered
    const nonDeliveredOrders = selectedOrderObjects.filter(order => order.status !== 'delivered');
    if (nonDeliveredOrders.length > 0) {
      toast.error("يمكن إنشاء فاتورة مشتركة لطلبات تم التسليم فقط");
      return;
    }

    try {
      await generateCombinedInvoicePDF(selectedOrderObjects, customerName);
      toast.success("تم إنشاء الفاتورة المشتركة بنجاح");
      setSelectedOrders(new Set()); // Clear selection after successful generation
    } catch (error) {
      toast.error("حدث خطأ في إنشاء الفاتورة");
      console.error("Error generating combined invoice:", error);
    }
  };

  if (loading) return <div className="text-center p-4">جاري التحميل...</div>;
  if (error) return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;

  const filteredOrders = orders.filter(order => {
    if (!debouncedSearch) return true;
    return order.trackingNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
           order.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedDeliveredOrders = paginatedOrders.filter(order => 
    selectedOrders.has(order.id) && order.status === 'delivered'
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search and Filter Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم التتبع أو اسم الطلب..."
            className="pr-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="جميع الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="purchased">تم الشراء</SelectItem>
            <SelectItem value="arrived_to_china">وصل إلى الصين</SelectItem>
            <SelectItem value="shipping_to_libya">جاري الشحن إلى ليبيا</SelectItem>
            <SelectItem value="arrived_libya">وصل إلى ليبيا</SelectItem>
            <SelectItem value="ready_for_pickup">جاهز للاستلام</SelectItem>
            <SelectItem value="delivered">تم التسليم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedDeliveredOrders.length > 0 && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  فاتورة مشتركة
                </h3>
                <p className="text-sm text-blue-600">
                  تم تحديد {selectedDeliveredOrders.length} طلب تم التسليم
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateCombinedInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              إنشاء فاتورة مشتركة
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border pr-4 pl-4" dir="rtl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-12">
                <Checkbox
                  checked={selectedDeliveredOrders.length === paginatedOrders.filter(order => order.status === 'delivered').length && paginatedOrders.filter(order => order.status === 'delivered').length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-right">رقم التتبع</TableHead>
              <TableHead className="text-right">اسم الطلب</TableHead>
              <TableHead className="text-right">السعر (USD)</TableHead>
              <TableHead className="text-right">نوع الشحن</TableHead>
              <TableHead className="text-right">سعر الشحن</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedOrders.has(order.id)}
                    onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    disabled={order.status !== 'delivered'}
                  />
                </TableCell>
                <TableCell className="font-medium font-mono">
                  {order.trackingNumber}
                </TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell>${order.usdPrice}</TableCell>
                <TableCell>{order.shippingRate?.name || "-"}</TableCell>
                <TableCell>{order.shippingCost ? `$${order.shippingCost}` : "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {statusMap[order.status] || order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  لا يوجد طلبات لهذا العميل
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            عرض {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)} إلى {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} من {filteredOrders.length} طلب
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <span className="text-sm">
              الصفحة {currentPage} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
