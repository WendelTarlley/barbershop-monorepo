// lib/http/errorInterceptor.ts

export async function errorInterceptor(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      // 🔥 token expirado
      console.log("Não autorizado");

      // opcional: redirect login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    const error = await response.json().catch(() => ({}));

    throw {
      status: response.status,
      message: error?.message || "Erro na requisição",
    };
  }

  return response.json();
}