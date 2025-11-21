async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.json();
}

export async function fetchWarehouses() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/warehouses", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse<{ data: unknown[] }>(response);
}
