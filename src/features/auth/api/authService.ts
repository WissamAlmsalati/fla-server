"use client";

type LoginPayload = {
  email: string;
  password: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.json();
}

export async function login(payload: LoginPayload) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse<{ 
    message: string; 
    accessToken: string; 
    user: { id: number; role: string; name: string; email: string } 
  }>(response);
}
