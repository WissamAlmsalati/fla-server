type OrderFilters = Record<string, string | number>;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.json();
}

export async function fetchOrders(filters?: OrderFilters) {
  let query = "";
  if (filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, String(value));
    });
    query = params.toString() ? `?${params.toString()}` : "";
  }
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/orders${query}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse<{ data: unknown[]; meta?: Record<string, unknown> }>(response);
}

export async function createOrder(payload: {
  tracking_number: string;
  name: string;
  usd_price: number;
  customer_id: number;
  notes?: string;
  product_url?: string;
  cny_price?: number;
  weight?: number;
  country?: string;
}) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ data: unknown }>(response);
}

export async function updateOrder(id: number, payload: {
  status?: string;
  weight?: number;
  tracking_number?: string;
  name?: string;
  usd_price?: number;
  cny_price?: number;
  product_url?: string;
  notes?: string;
  shippingRateId?: number;
}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<unknown>(response);
}

export async function fetchOrder(id: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/orders/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse<unknown>(response);
}

export async function fetchMessages(orderId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/orders/${orderId}/messages`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse<{ data: any[] }>(response);
}

export async function sendMessage(orderId: number, content: string, image?: File | null, replyToId?: number) {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  // Always append content, even if empty (for image-only messages)
  formData.append("content", content || "");

  if (image) {
    formData.append("image", image);
  }

  if (replyToId) {
    formData.append("replyToId", replyToId.toString());
  }

  const response = await fetch(`/api/orders/${orderId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });
  return handleResponse<{ data: any }>(response);
}
