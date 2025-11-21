"use client";

type LoginPayload = {
  email: string;
  password: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    // Translate common error messages to Arabic
    let errorMessage = payload.error ?? "Request failed";
    if (errorMessage === "Invalid credentials") {
      errorMessage = "بيانات الدخول غير صحيحة";
    } else if (errorMessage === "Invalid request") {
      errorMessage = "طلب غير صحيح";
    } else if (errorMessage === "Token invalid") {
      errorMessage = "الجلسة منتهية الصلاحية، يرجى تسجيل الدخول مرة أخرى";
    }
    throw new Error(errorMessage);
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
