async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?expired=true";
      }
    }
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.json();
}

export async function fetchWarehouses(filters?: Record<string, string | number>) {
  let query = "";
  if (filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, String(value));
    });
    query = params.toString() ? `?${params.toString()}` : "";
  }
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/warehouses${query}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse<{ data: unknown[] }>(response);
}
